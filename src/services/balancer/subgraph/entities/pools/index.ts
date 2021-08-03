import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';
import { getPoolLiquidity } from '@/lib/utils/balancer/price';
import { bnum } from '@/lib/utils';
import {
  Pool,
  QueryBuilder,
  TimeTravelPeriod,
  DecoratedPool,
  PoolToken
} from '../../types';
import { getAddress } from '@ethersproject/address';
import {
  currentLiquidityMiningRewards,
  computeTotalAPRForPool
} from '@/lib/utils/liquidityMining';
import { NetworkId } from '@/constants/network';
import { configService as _configService } from '@/services/config/config.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { FiatCurrency } from '@/constants/currency';
import { isStable } from '@/composables/usePool';

const IS_LIQUIDITY_MINING_ENABLED = true;

export default class Pools {
  service: Service;
  query: QueryBuilder;
  networkId: NetworkId;

  constructor(
    service: Service,
    query: QueryBuilder = queryBuilder,
    private readonly configService = _configService
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

  public async decorate(
    pools: Pool[],
    period: TimeTravelPeriod,
    prices: TokenPrices,
    currency: FiatCurrency
  ): Promise<DecoratedPool[]> {
    // Get past state of pools
    const blockNumber = await this.timeTravelBlock(period);
    const block = { number: blockNumber };
    const isInPoolIds = { id_in: pools.map(pool => pool.id) };
    const pastPoolsQuery = this.query({ where: isInPoolIds, block });
    const { pools: pastPools } = await this.service.client.get(pastPoolsQuery);

    return this.serialize(pools, pastPools, period, prices, currency);
  }

  private serialize(
    pools: Pool[],
    pastPools: Pool[],
    period: TimeTravelPeriod,
    prices: TokenPrices,
    currency: FiatCurrency
  ): DecoratedPool[] {
    return pools.map(pool => {
      pool.address = this.addressFor(pool.id);
      pool.tokenAddresses = pool.tokensList.map(t => getAddress(t));
      pool.tokens = this.formatPoolTokens(pool);
      pool.totalLiquidity = getPoolLiquidity(pool, prices, currency);

      const pastPool = pastPools.find(p => p.id === pool.id);
      const volume = this.calcVolume(pool, pastPool);
      const poolAPR = this.calcAPR(pool, pastPool);
      const fees = this.calcFees(pool, pastPool);
      const {
        hasLiquidityMiningRewards,
        liquidityMiningAPR
      } = this.calcLiquidityMiningAPR(pool, prices, currency);
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

  private formatPoolTokens(pool: Pool): PoolToken[] {
    const tokens = pool.tokens.map(token => ({
      ...token,
      address: getAddress(token.address)
    }));

    if (isStable(pool)) return tokens;

    return tokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
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

  private calcLiquidityMiningAPR(
    pool: Pool,
    prices: TokenPrices,
    currency: FiatCurrency
  ) {
    let liquidityMiningAPR = '0';

    const liquidityMiningRewards = currentLiquidityMiningRewards[pool.id];

    const hasLiquidityMiningRewards = IS_LIQUIDITY_MINING_ENABLED
      ? !!liquidityMiningRewards
      : false;

    if (hasLiquidityMiningRewards) {
      liquidityMiningAPR = computeTotalAPRForPool(
        liquidityMiningRewards,
        prices,
        currency,
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

  public addressFor(poolId: string): string {
    return getAddress(poolId.slice(0, 42));
  }
}
