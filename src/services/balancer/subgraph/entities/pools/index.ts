import Service from '../../balancer-subgraph.service';
import queryBuilder from './query';
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
  computeTotalAPRForPool,
  computeAPRsForPool
} from '@/lib/utils/liquidityMining';
import { NetworkId } from '@/constants/network';
import { configService as _configService } from '@/services/config/config.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { FiatCurrency } from '@/constants/currency';
import { isStable, isWstETH } from '@/composables/usePool';
import { oneSecondInMs, twentyFourHoursInSecs } from '@/composables/useTime';
import { lidoService } from '@/services/lido/lido.service';
import PoolService from '@/services/pool/pool.service';
import { differenceInWeeks } from 'date-fns';

const IS_LIQUIDITY_MINING_ENABLED = true;

export default class Pools {
  service: Service;
  query: QueryBuilder;
  networkId: NetworkId;

  constructor(
    service: Service,
    query: QueryBuilder = queryBuilder,
    private readonly configService = _configService,
    private readonly poolServiceClass = PoolService
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

  private async serialize(
    pools: Pool[],
    pastPools: Pool[],
    period: TimeTravelPeriod,
    prices: TokenPrices,
    currency: FiatCurrency
  ): Promise<DecoratedPool[]> {
    const promises = pools.map(async pool => {
      const poolService = new this.poolServiceClass(pool);

      pool.address = this.addressFor(pool.id);
      pool.tokenAddresses = pool.tokensList.map(t => getAddress(t));
      pool.tokens = this.formatPoolTokens(pool);
      pool.totalLiquidity = poolService.calcTotalLiquidity(prices, currency);

      const pastPool = pastPools.find(p => p.id === pool.id);
      const volume = this.calcVolume(pool, pastPool);
      const poolAPR = this.calcAPR(pool, pastPool);
      const fees = this.calcFees(pool, pastPool);
      const {
        hasLiquidityMiningRewards,
        liquidityMiningAPR,
        liquidityMiningBreakdown
      } = this.calcLiquidityMiningAPR(pool, prices, currency);
      const thirdPartyAPR = await this.calcThirdPartyAPR(pool);
      const totalAPR = this.calcTotalAPR(
        poolAPR,
        liquidityMiningAPR,
        thirdPartyAPR
      );
      const isNewPool = this.isNewPool(pool);

      return {
        ...pool,
        hasLiquidityMiningRewards,
        dynamic: {
          period,
          volume,
          fees,
          apr: {
            pool: poolAPR,
            thirdParty: thirdPartyAPR,
            liquidityMining: liquidityMiningAPR,
            liquidityMiningBreakdown,
            total: totalAPR
          },
          isNewPool
        }
      };
    });

    return Promise.all(promises);
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
    let liquidityMiningBreakdown = {};

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
      liquidityMiningBreakdown = computeAPRsForPool(
        liquidityMiningRewards,
        prices,
        currency,
        pool.totalLiquidity
      );
    }

    return {
      hasLiquidityMiningRewards,
      liquidityMiningAPR,
      liquidityMiningBreakdown
    };
  }

  /**
   * Fetch additional APRs not covered by pool swap fees and
   * liquidity minning rewards. These APRs may require 3rd party
   * API requests.
   */
  private async calcThirdPartyAPR(pool: Pool): Promise<string> {
    if (isWstETH(pool)) {
      return await lidoService.calcStEthAPRFor(pool);
    }
    return '0';
  }

  private calcTotalAPR(
    poolAPR: string,
    liquidityMiningAPR: string,
    thirdPartyAPR: string
  ): string {
    return bnum(poolAPR)
      .plus(liquidityMiningAPR)
      .plus(thirdPartyAPR)
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
