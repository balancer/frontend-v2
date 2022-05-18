import { Network } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';
import axios from 'axios';
import { differenceInWeeks } from 'date-fns';

import { networkId } from '@/composables/useNetwork';
import { isStable } from '@/composables/usePool';
import { oneSecondInMs, twentyFourHoursInSecs } from '@/composables/useTime';
import { FiatCurrency } from '@/constants/currency';
import { bnum } from '@/lib/utils';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { SubgraphGauge } from '@/services/balancer/gauges/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { configService as _configService } from '@/services/config/config.service';
import PoolService from '@/services/pool/pool.service';
import { stakingRewardsService } from '@/services/staking/staking-rewards.service';
import { TokenInfoMap } from '@/types/TokenList';

import Service from '../../balancer-subgraph.service';
import {
  DecoratedPool,
  Pool,
  PoolToken,
  QueryBuilder,
  TimeTravelPeriod
} from '../../types';
import {
  ExcludedAddresses,
  removeAddressesFromTotalLiquidity
} from './helpers';
import queryBuilder from './query';

type ExcludedAddressesResponse = Record<Network, Record<string, string[]>>;

export default class Pools {
  service: Service;
  query: QueryBuilder;
  networkId: Network;
  excludedAddresses: ExcludedAddresses;

  constructor(
    service: Service,
    query: QueryBuilder = queryBuilder,
    private readonly configService = _configService,
    private readonly poolServiceClass = PoolService,
    private readonly balancerContracts = balancerContractsService
  ) {
    this.service = service;
    this.query = query;
    this.networkId = configService.env.NETWORK;
    this.excludedAddresses = null;
  }

  public async get(args = {}, attrs = {}): Promise<Pool[]> {
    const query = this.query(args, attrs);
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
  ): Promise<DecoratedPool[]> {
    // Get past state of pools
    const blockNumber = await this.timeTravelBlock(period);
    const block = { number: blockNumber };
    const isInPoolIds = { id_in: pools.map(pool => pool.id) };
    const pastPoolsQuery = this.query({ where: isInPoolIds, block });
    let pastPools: Pool[] = [];
    try {
      const data: { pools: Pool[] } = await this.service.client.get(
        pastPoolsQuery
      );
      pastPools = data.pools;
    } catch {
      // eslint-disable-previous-line no-empty
    }

    if (this.excludedAddresses == null) {
      // fetch only once
      this.excludedAddresses = await this.getExcludedAddresses();
    }

    return this.serialize(
      pools,
      pastPools,
      period,
      prices,
      currency,
      gauges,
      tokens
    );
  }

  public removeExcludedAddressesFromTotalLiquidity(
    pool: Pool,
    totalLiquidityString: string
  ) {
    return removeAddressesFromTotalLiquidity(
      this.excludedAddresses,
      pool,
      totalLiquidityString
    );
  }

  private async serialize(
    pools: Pool[],
    pastPools: Pool[],
    period: TimeTravelPeriod,
    prices: TokenPrices,
    currency: FiatCurrency,
    gauges: SubgraphGauge[],
    tokens: TokenInfoMap
  ): Promise<DecoratedPool[]> {
    const [
      protocolFeePercentage,
      gaugeBALAprs,
      gaugeRewardTokenAprs
    ] = await Promise.all([
      this.balancerContracts.vault.protocolFeesCollector.getSwapFeePercentage(),
      await stakingRewardsService.getGaugeBALAprs({
        prices,
        gauges,
        pools
      }),
      await stakingRewardsService.getRewardTokenAprs({
        prices,
        gauges,
        pools,
        tokens
      })
    ]);

    const promises = pools.map(async pool => {
      const poolService = new this.poolServiceClass(pool);

      pool.address = this.addressFor(pool.id);
      pool.tokenAddresses = pool.tokensList.map(t => getAddress(t));
      pool.tokens = this.formatPoolTokens(pool);
      pool.totalLiquidity = poolService.calcTotalLiquidity(prices, currency);
      pool.miningTotalLiquidity = this.removeExcludedAddressesFromTotalLiquidity(
        pool,
        pool.totalLiquidity
      );

      const pastPool = pastPools.find(p => p.id === pool.id);
      const volume = this.calcVolume(pool, pastPool);
      const fees = this.calcFees(pool, pastPool);

      const apr = await poolService.apr.calc(
        pastPool,
        prices,
        currency,
        protocolFeePercentage,
        gaugeBALAprs[pool.id],
        gaugeRewardTokenAprs[pool.id]
      );

      return {
        ...pool,
        dynamic: {
          period,
          volume,
          fees,
          apr,
          isNewPool: this.isNewPool(pool)
        }
      };
    });

    return Promise.all(promises);
  }

  private async getExcludedAddresses() {
    try {
      const { data } = await axios.get<ExcludedAddressesResponse>(
        'https://raw.githubusercontent.com/balancer-labs/bal-mining-scripts/master/config/exclude.json'
      );

      if (data[networkId.value]) {
        const poolMulticaller = new Multicaller(
          this.balancerContracts.config.key,
          this.balancerContracts.provider,
          this.balancerContracts.allPoolABIs
        );

        Object.entries(data[networkId.value]).forEach(
          ([poolAddress, accounts]) => {
            accounts.forEach(account => {
              const poolAddressNormalized = getAddress(poolAddress);

              poolMulticaller.call(
                `${poolAddressNormalized}.${account}`,
                poolAddressNormalized,
                'balanceOf',
                [account]
              );
            });
          }
        );

        return await poolMulticaller.execute();
      }
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  private formatPoolTokens(pool: Pool): PoolToken[] {
    const tokens = pool.tokens.map(token => ({
      ...token,
      address: getAddress(token.address)
    }));

    if (isStable(pool.poolType)) return tokens;

    return tokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
  }

  private calcVolume(pool: Pool, pastPool: Pool | undefined): string {
    if (!pastPool) return pool.totalSwapVolume;

    return bnum(pool.totalSwapVolume)
      .minus(pastPool.totalSwapVolume)
      .toString();
  }

  private calcFees(pool: Pool, pastPool: Pool | undefined): string {
    if (!pastPool) return pool.totalSwapFee;

    return bnum(pool.totalSwapFee)
      .minus(pastPool.totalSwapFee)
      .toString();
  }

  private async timeTravelBlock(period: TimeTravelPeriod): Promise<number> {
    const currentBlock = await this.service.rpcProviderService.getBlockNumber();
    const blocksInDay = Math.round(
      twentyFourHoursInSecs / this.service.blockTime
    );

    switch (period) {
      case '24h':
        return currentBlock - blocksInDay;
      default:
        return currentBlock - blocksInDay;
    }
  }

  private isNewPool(pool: Pool): boolean {
    return differenceInWeeks(Date.now(), pool.createTime * oneSecondInMs) < 1;
  }

  public addressFor(poolId: string): string {
    return getAddress(poolId.slice(0, 42));
  }
}
