import { isStablePhantom } from '@/composables/usePool';
import { FiatCurrency } from '@/constants/currency';
import { bnSum, bnum } from '@/lib/utils';
import { calcUSDPlusWeightedAPR } from '@/lib/utils/apr.helper';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { aaveService } from '@/services/aave/aave.service';
import { AnyPool, PoolAPRs } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { lidoService } from '@/services/lido/lido.service';
import { GaugeBalApr } from '@/services/staking/staking-rewards.service';

export class AprConcern {
  constructor(
    public readonly pool: AnyPool,
    public readonly lido = lidoService,
    public readonly aave = aaveService
  ) {}

  public async calc(
    poolSnapshot: AnyPool | undefined,
    prices: TokenPrices,
    currency: FiatCurrency,
    protocolFeePercentage: number,
    gaugeBalApr: GaugeBalApr,
    gaugeRewardApr: string
  ): Promise<PoolAPRs> {
    const swapFeeAPR = this.calcSwapFeeAPR(poolSnapshot, protocolFeePercentage);
    const yieldAPR = await this.calcYieldAPR(
      prices,
      currency,
      protocolFeePercentage
    );
    const totalAPR = bnSum([swapFeeAPR, yieldAPR.total]).toString();

    return {
      total: totalAPR,
      swap: swapFeeAPR,
      yield: yieldAPR,
      staking: {
        bal: gaugeBalApr,
        rewards: gaugeRewardApr
      }
    };
  }

  private calcSwapFeeAPR(
    poolSnapshot: AnyPool | undefined,
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
   * @description Fetch additional APRs not covered by pool swap fees and
   * liquidity minning rewards. These APRs may require 3rd party
   * API requests.
   * @returns total yield APR and breakdown of total by pool token.
   */
  private async calcYieldAPR(
    prices: TokenPrices,
    currency: FiatCurrency,
    protocolFeePercentage: number
  ): Promise<{ total: string; breakdown: Record<string, string> }> {
    let total = '0';
    let breakdown = {};

    if (includesWstEth(this.pool.tokensList)) {
      total = await this.lido.calcStEthAPRFor(this.pool, protocolFeePercentage);
    } else if (isStablePhantom(this.pool.poolType)) {
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
          '0x6933ec1CA55C06a894107860c92aCdFd2Dd8512f'
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

          breakdown[wrappedToken] = weightedAPR.toString();

          total = bnSum(Object.values(breakdown)).toString();
        }
      }
    }

    return {
      total,
      breakdown
    };
  }
}
