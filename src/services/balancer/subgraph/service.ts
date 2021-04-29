import Client from './client';
import Queries from './queries';
import InfuraService from '@/services/infura/service';
import { getPoolLiquidity } from '@/utils/balancer/price';
import { bnum } from '@/utils';
import { Pool, DecoratedPool, TimeTravelPeriod } from './types';
import { Prices } from '@/api/coingecko';

export default class Service {
  client: Client;
  queries: Record<string, Function>;
  infuraService: InfuraService;

  constructor(
    client = new Client(),
    queries = Queries,
    infuraService = new InfuraService()
  ) {
    this.client = client;
    this.queries = queries;
    this.infuraService = infuraService;
  }

  public async getPools(args = {}): Promise<Pool[]> {
    const query = this.queries.pools(args);
    const data = await this.client.get(query);
    return data.pools;
  }

  public async getDecoratedPools(
    period: TimeTravelPeriod,
    prices: Prices,
    args = {}
  ): Promise<DecoratedPool[]> {
    const block = { number: await this.timeTravelBlock(period) };
    const pools = await this.getPools(args);
    const pastPools = await this.getPools({ ...args, block });
    return this.generateDecoratedPools(pools, pastPools, period, prices);
  }

  private generateDecoratedPools(
    pools: Pool[],
    pastPools: Pool[],
    period: TimeTravelPeriod,
    prices: Prices
  ): DecoratedPool[] {
    return pools.map((pool, i) => {
      pool.totalLiquidity = getPoolLiquidity(pool, prices);
      const volume = this.calcVolume(pool, pastPools[i]);
      const apy = this.calcAPY(pool, pastPools[i]);

      return { ...pool, dynamic: { period, volume, apy } };
    });
  }

  private calcVolume(pool: Pool, pastPool: Pool | undefined): string {
    if (!pastPool) return pool.totalSwapVolume;

    return bnum(pool.totalSwapVolume)
      .minus(pastPool.totalSwapVolume)
      .toString();
  }

  private calcAPY(pool: Pool, pastPool: Pool | undefined): string {
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

  private async timeTravelBlock(period: TimeTravelPeriod): Promise<number> {
    const currentBlock = await this.infuraService.getBlockNumber();
    const blocksInDay = Math.round((24 * 60 * 60) / 13);

    switch (period) {
      case '24h':
        return currentBlock - blocksInDay;
      default:
        return currentBlock - blocksInDay;
    }
  }
}
