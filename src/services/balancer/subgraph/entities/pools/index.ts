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
import { Pool, PoolType } from '@/services/pool/types';
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
    // hardcoded workaround for tetuBAL pool
    if (
      args['where'].id ==
      '0xd9a6efb07ff8cc69bcb20a0c2229486e949c2270000200000000000000000562'
    ) {
      return [
        {
          address: '0xd9a6efb07ff8cc69bcb20a0c2229486e949c2270',
          // ,amp: 500
          createTime: 1624551483,
          factory: '0xca96c4f198d343e251b1a01f3eba061ef3da73c1',
          id:
            '0xd9a6efb07ff8cc69bcb20a0c2229486e949c2270000200000000000000000562',
          owner: '0xd2bd536adb0198f74d5f4f2bd4fe68bae1e1ba80',
          poolType: PoolType.Stable,
          // ,swapEnabled: 'true'
          swapFee: '0.0025',
          tokens: [
            {
              address: '0x3d468ab2329f296e1b9d8476bb54dd77d8c2320f',
              balance: '0',
              weight: 'null',
              priceRate: '1',
              symbol: '20WETH-80BAL'
            },
            {
              address: '0x7fc9e0aa043787bfad28e29632ada302c790ce33',
              balance: '0',
              weight: 'null',
              priceRate: '1',
              symbol: 'tetuBAL'
            }
          ],
          tokensList: [
            '0x3d468ab2329f296e1b9d8476bb54dd77d8c2320f',
            '0x7fc9e0aa043787bfad28e29632ada302c790ce33'
          ],
          totalLiquidity: '0',
          totalShares: '10',
          totalSwapFee: '0',
          totalSwapVolume: '0'
        }
      ];
    }
    const data = await this.service.client.get(query);
    return data.pools;
  }

  public async decorate(
    pools: Pool[],
    period: TimeTravelPeriod,
    prices: TokenPrices,
    currency: FiatCurrency,
    gauges: SubgraphGauge[],
    tokens: TokenInfoMap
  ): Promise<Pool[]> {
    // Get past state of pools
    const currentBlock = await this.service.rpcProviderService.getBlockNumber();
    const blockNumber = await getTimeTravelBlock(currentBlock, period);
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
