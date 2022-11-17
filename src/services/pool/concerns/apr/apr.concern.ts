import { isGoerli, networkId } from '@/composables/useNetwork';
import { isDeep, isVeBalPool } from '@/composables/usePool';
import { FiatCurrency } from '@/constants/currency';
import { bnSum, bnum } from '@/lib/utils';
import { calcUSDPlusWeightedAPR } from '@/lib/utils/apr.helper';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { aaveService } from '@/services/aave/aave.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { lidoService } from '@/services/lido/lido.service';
import { Pool } from '@/services/pool/types';
import {
  AprBreakdown,
  PoolsStaticRepository,
  StaticTokenPriceProvider,
  Pools,
  BalancerDataRepositories,
} from '@balancer-labs/sdk';
import { VeBalAprCalc } from './calcs/vebal-apr.calc';
import { balancer } from '@/lib/balancer.sdk';

export class AprConcern {
  constructor(
    public pool: Pool,
    private readonly lido = lidoService,
    private readonly aave = aaveService,
    private readonly VeBalAprCalcClass = VeBalAprCalc
  ) {}

  public async calc(
    poolSnapshot: Pool,
    prices: TokenPrices
  ): Promise<AprBreakdown> {
    const poolsRepository = new PoolsStaticRepository([poolSnapshot]);
    const tokenPriceRepository = new StaticTokenPriceProvider(prices);

    const dataRepositories = balancer.data;
    const poolsRepositories: BalancerDataRepositories = {
      ...dataRepositories,
      ...{
        // pools: poolsRepository,
        // tokenPrices: tokenPriceRepository,
      },
    };

    const pools = new Pools(balancer.networkConfig, poolsRepositories);
    const pool = (await pools.find(poolSnapshot.id)) || poolSnapshot;
    const apr = await pools.apr(pool);

    return apr;
  }

  private calcSwapFeeAPR(
    poolSnapshot: Pool | undefined,
    protocolFeePercentage: number
  ): string {
    if (!poolSnapshot)
      return bnum(this.pool.totalSwapFee)
        .times(1 - protocolFeePercentage)
        .dividedBy(this.pool.totalLiquidity)
        .multipliedBy(365)
        .toString();

    const swapFees = bnum(this.pool.totalSwapFee).minus(
      poolSnapshot.totalSwapFee
    );

    return swapFees
      .times(1 - protocolFeePercentage)
      .dividedBy(this.pool.totalLiquidity)
      .multipliedBy(365)
      .toString();
  }

  /**
   * @description Calculate APRs coming from underlying yield bearing tokens
   * such as Aave tokens.
   * @returns total yield APR and breakdown of total by pool token.
   */
  private async calcYieldAPR(
    prices: TokenPrices,
    currency: FiatCurrency,
    protocolFeePercentage: number
  ): Promise<{ total: number; breakdown: { [address: string]: number } }> {
    let total = '0';
    let breakdown = {};

    if (includesWstEth(this.pool.tokensList)) {
      total = await this.lido.calcStEthAPRFor(this.pool, protocolFeePercentage);
    } else if (isDeep(this.pool)) {
      const aaveAPR = await this.aave.calcWeightedSupplyAPRFor(
        this.pool,
        prices,
        currency
      );
      ({ total, breakdown } = aaveAPR);

      // TODO burn with fire once scalable linear pool support is added.
      // If USD+ pool, replace aave APR with USD+
      const usdPlusPools = {
        '0xb973ca96a3f0d61045f53255e319aedb6ed4924000000000000000000000042f':
          '0x1aAFc31091d93C3Ff003Cff5D2d8f7bA2e728425',
        '0xf48f01dcb2cbb3ee1f6aab0e742c2d3941039d56000000000000000000000445':
          '0x6933ec1CA55C06a894107860c92aCdFd2Dd8512f',
      };
      if (Object.keys(usdPlusPools).includes(this.pool.id)) {
        const linearPoolAddress = usdPlusPools[this.pool.id];
        const linearPool = this.pool.onchain?.linearPools?.[linearPoolAddress];
        if (linearPool) {
          const wrappedToken = linearPool.wrappedToken.address;
          const weightedAPR = await calcUSDPlusWeightedAPR(
            this.pool,
            linearPool,
            linearPoolAddress,
            prices,
            currency
          );

          breakdown[wrappedToken] = Number(weightedAPR);

          total = bnSum(Object.values(breakdown)).toString();
        }
      }
    }

    return {
      total: Number(total),
      breakdown,
    };
  }

  private async calcVeBalAPR(prices: TokenPrices): Promise<string> {
    if (!isVeBalPool(this.pool.id) || isGoerli.value) return '0';

    const veBalApr = new this.VeBalAprCalcClass();
    return await veBalApr.calc(
      this.pool.totalLiquidity,
      this.pool.totalShares,
      prices
    );
  }
}
