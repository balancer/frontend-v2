import Service from '../../service';
import queryBuilder from './query';
import { getPoolLiquidity } from '@/lib/utils/balancer/price';
import { bnum } from '@/lib/utils';
import {
  Pool,
  QueryBuilder,
  TimeTravelPeriod,
  DecoratedPool
} from '../../types';
import { Prices } from '@/services/coingecko';
import { getAddress } from '@ethersproject/address';
import {
  currentLiquidityMiningRewards,
  computeTotalAPRForPool
} from '@/lib/utils/liquidityMining';
import { NetworkId } from '@/constants/network';
import ConfigService from '@/services/config/config.service';

const IS_LIQUIDITY_MINING_ENABLED = true;

export default class Pools {
  service: Service;
  query: QueryBuilder;
  networkId: NetworkId;

  constructor(
    service: Service,
    query: QueryBuilder = queryBuilder,
    private readonly configService = new ConfigService()
  ) {
    this.service = service;
    this.query = query;
    this.networkId = Number(configService.env.NETWORK) as NetworkId;
  }

  public async get(args = {}, attrs = {}): Promise<Pool[]> {
    const query = this.query(args, attrs);
    const data = await this.service.client.get(query);
    return data.pools;
  }

  public async getDecorated(
    period: TimeTravelPeriod,
    prices: Prices,
    args = {},
    attrs = {}
  ): Promise<DecoratedPool[]> {
    // Get current pools
    const currentPoolsQuery = this.query(args, attrs);
    const [{ pools: currentPools }, blockNumber] = await Promise.all([
      this.service.client.get(currentPoolsQuery),
      this.timeTravelBlock(period)
    ]);

    // Get past state of current pools
    const block = { number: blockNumber };
    const isCurrentPool = { id_in: currentPools.map(pool => pool.id) };
    const pastPoolsQuery = this.query({ where: isCurrentPool, block }, attrs);
    const { pools: pastPools } = await this.service.client.get(pastPoolsQuery);

    return this.serialize(currentPools, pastPools, period, prices);
  }

  private serialize(
    pools: Pool[],
    pastPools: Pool[],
    period: TimeTravelPeriod,
    prices: Prices
  ): DecoratedPool[] {
    return pools.map(pool => {
      pool.address = this.extractAddress(pool.id);
      pool.tokenAddresses = pool.tokensList.map(t => getAddress(t));
      pool.totalLiquidity = getPoolLiquidity(pool, prices);
      const pastPool = pastPools.find(p => p.id === pool.id);
      const volume = this.calcVolume(pool, pastPool);
      const poolAPR = this.calcAPR(pool, pastPool);
      const fees = this.calcFees(pool, pastPool);
      const {
        hasLiquidityMiningRewards,
        liquidityMiningAPR
      } = this.calcLiquidityMiningAPR(pool, prices);
      const totalAPR = this.calcTotalAPR(poolAPR, liquidityMiningAPR);

      return {
        ...pool,
        hasLiquidityMiningRewards,
        dynamic: {
          period,
          volume,
          fees,
          apr: {
            pool: poolAPR,
            liquidityMining: liquidityMiningAPR,
            total: totalAPR
          }
        }
      };
    });
  }

  private calcVolume(pool: Pool, pastPool: Pool | undefined): string {
    if (!pastPool) return pool.totalSwapVolume;

    return bnum(pool.totalSwapVolume)
      .minus(pastPool.totalSwapVolume)
      .toString();
  }

  private calcAPR(pool: Pool, pastPool?: Pool) {
    if (!pastPool)
      return bnum(pool.totalSwapFee)
        .dividedBy(pool.totalLiquidity)
        .multipliedBy(365)
        .toString();

    const swapFees = bnum(pool.totalSwapFee).minus(pastPool.totalSwapFee);
    return swapFees
      .dividedBy(pool.totalLiquidity)
      .multipliedBy(365)
      .toString();
  }

  private calcLiquidityMiningAPR(pool: Pool, prices: Prices) {
    let liquidityMiningAPR = '0';

    const liquidityMiningRewards = currentLiquidityMiningRewards[pool.id];

    const hasLiquidityMiningRewards = IS_LIQUIDITY_MINING_ENABLED
      ? !!liquidityMiningRewards
      : false;

    if (hasLiquidityMiningRewards) {
      liquidityMiningAPR = computeTotalAPRForPool(
        liquidityMiningRewards,
        prices,
        pool.totalLiquidity
      );
    }

    return {
      hasLiquidityMiningRewards,
      liquidityMiningAPR
    };
  }

  private calcTotalAPR(poolAPR: string, liquidityMiningAPR: string) {
    return bnum(poolAPR)
      .plus(liquidityMiningAPR)
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
    const dayInSecs = 24 * 60 * 60;
    const blocksInDay = Math.round(dayInSecs / this.service.blockTime);

    switch (period) {
      case '24h':
        return currentBlock - blocksInDay;
      default:
        return currentBlock - blocksInDay;
    }
  }

  private extractAddress(poolId: string): string {
    return getAddress(poolId.slice(0, 42));
  }
}
