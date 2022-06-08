import { Network } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';

import {
  getTimeTravelBlock,
  TimeTravelPeriod
} from '@/composables/useSnapshots';
import { FiatCurrency } from '@/constants/currency';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { configService as _configService } from '@/services/config/config.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import PoolService from '@/services/pool/pool.service';
import { Pool } from '@/services/pool/types';
import { QueryBuilder } from '@/types/subgraph';
import { TokenInfoMap } from '@/types/TokenList';

import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';

export default class Pools {
  service: Service;
  query: QueryBuilder;
  networkId: Network;

  constructor(
    service: Service,
    query: QueryBuilder = queryBuilder,
    private readonly configService = _configService,
    private readonly poolServiceClass = PoolService,
    private readonly balancerContracts = balancerContractsService,
    private readonly poolDecoratorClass = PoolDecorator
  ) {
    this.service = service;
    this.query = query;
    this.networkId = configService.env.NETWORK;
  }

  public async get(args = {}, attrs = {}): Promise<Pool[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.pools;
  }

  public async decorate(
    pools: Pool[],
    prices: TokenPrices,
    currency: FiatCurrency,
    gauges: SubgraphGauge[],
    tokens: TokenInfoMap
  ): Promise<Pool[]> {
    // Get past state of pools
    const currentBlock = await this.service.rpcProviderService.getBlockNumber();
    const blockNumber = await getTimeTravelBlock(currentBlock);
    const block = { number: blockNumber };
    const isInPoolIds = { id_in: pools.map(pool => pool.id) };
    const poolSnapshotQuery = this.query({ where: isInPoolIds, block });
    let poolSnapshots: Pool[] = [];
    try {
      const data: { pools: Pool[] } = await this.service.client.get(
        poolSnapshotQuery
      );
      poolSnapshots = data.pools;
    } catch {
      // eslint-disable-previous-line no-empty
    }

    const poolDecorator = new this.poolDecoratorClass(pools);

    return await poolDecorator.decorate(
      gauges,
      prices,
      currency,
      poolSnapshots,
      tokens
    );
  }

  public addressFor(poolId: string): string {
    return getAddress(poolId.slice(0, 42));
  }
}
