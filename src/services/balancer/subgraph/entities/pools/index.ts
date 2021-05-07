import Service from '../../service';
import poolQueryBuilder from './query';
import { getPoolLiquidity } from '@/utils/balancer/price';
import { bnum } from '@/utils';
import {
  Pool,
  QueryBuilder,
  TimeTravelPeriod,
  DecoratedPool
} from '../../types';
import { Prices } from '@/api/coingecko';
import { getAddress } from '@ethersproject/address';

export default class Pools {
  service: Service;
  query: QueryBuilder;

  constructor(service, query = poolQueryBuilder) {
    this.service = service;
    this.query = query;
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
    attrs = { ...attrs, __aliasFor: 'pools' };
    const block = { number: await this.timeTravelBlock(period) };
    const query = {
      currentPools: this.query(args, attrs).pools,
      pastPools: this.query({ ...args, block }, attrs).pools
    };

    const { currentPools, pastPools } = await this.service.client.get(query);

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
      const apy = this.calcAPY(pool, pastPool);
      const fees = this.calcFees(pool, pastPool);

      return { ...pool, dynamic: { period, volume, apy, fees } };
    });
  }

  private calcVolume(pool: Pool, pastPool: Pool | undefined): string {
    if (!pastPool) return pool.totalSwapVolume;

    return bnum(pool.totalSwapVolume)
      .minus(pastPool.totalSwapVolume)
      .toString();
  }

  private calcAPY(pool: Pool, pastPool?: Pool) {
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

  private calcFees(pool: Pool, pastPool: Pool | undefined): string {
    if (!pastPool) return pool.totalSwapFee;

    return bnum(pool.totalSwapFee)
      .minus(pastPool.totalSwapFee)
      .toString();
  }

  private async timeTravelBlock(period: TimeTravelPeriod): Promise<number> {
    const currentBlock = await this.service.infuraService.getBlockNumber();
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
