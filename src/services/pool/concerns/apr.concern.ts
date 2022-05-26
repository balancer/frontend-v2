import { getAddress } from '@ethersproject/address';

import { isStablePhantom, isVeBalPool } from '@/composables/usePool';
import { getPreviousThursday, toUnixTimestamp } from '@/composables/useTime';
import { getPreviousEpoch } from '@/composables/useVeBAL';
import { FiatCurrency } from '@/constants/currency';
import { POOLS } from '@/constants/pools';
import { TOKENS } from '@/constants/tokens';
import { bnSum, bnum, getAddressFromPoolId } from '@/lib/utils';
import { calcUSDPlusWeightedAPR } from '@/lib/utils/apr.helper';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { aaveService } from '@/services/aave/aave.service';
import { feeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';
import { AprRange, Pool, PoolAPRs } from '@/services/balancer/subgraph/types';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { lidoService } from '@/services/lido/lido.service';
export class AprConcern {
  constructor(
    public pool: Pool,
    public readonly lido = lidoService,
    public readonly aave = aaveService,
    public readonly feeDistributorContract = feeDistributor
  ) {}

  public async calc(
    poolSnapshot: Pool | undefined,
    prices: TokenPrices,
    currency: FiatCurrency,
    protocolFeePercentage: number,
    stakingBalApr: AprRange,
    stakingRewardApr = '0'
  ): Promise<PoolAPRs> {
    const swapFeeAPR = this.calcSwapFeeAPR(poolSnapshot, protocolFeePercentage);

    const yieldAPR = await this.calcYieldAPR(
      prices,
      currency,
      protocolFeePercentage
    );

    const additionalAPRs = await this.calcAdditionalAPR(prices);

    const unstakedTotalAPR = bnSum([
      swapFeeAPR,
      yieldAPR.total,
      ...Object.values(additionalAPRs)
    ]).toString();

    const aprGivenBoost = (boost = '1') =>
      this.calcAprGivenBoost(
        unstakedTotalAPR,
        stakingBalApr,
        stakingRewardApr,
        boost
      );

    const stakedAprRange = this.calcStakedAprRange(
      unstakedTotalAPR,
      stakingBalApr,
      stakingRewardApr
    );

    return {
      total: {
        unstaked: unstakedTotalAPR,
        staked: {
          calc: aprGivenBoost,
          ...stakedAprRange
        }
      },
      swap: swapFeeAPR,
      yield: yieldAPR,
      staking: {
        bal: stakingBalApr,
        rewards: stakingRewardApr
      },
      additional: additionalAPRs
    };
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
   * @summary Total APR given boost
   */
  private calcAprGivenBoost(
    unstakedTotalAPR: string,
    stakingBalApr: AprRange,
    stakingRewardApr = '0',
    boost = '1'
  ): string {
    const stakedBaseAPR = bnum(unstakedTotalAPR).plus(stakingRewardApr);
    const boostedAPR = stakingBalApr?.min
      ? bnum(stakingBalApr.min).times(boost)
      : bnum('0');

    return stakedBaseAPR.plus(boostedAPR).toString();
  }

  /**
   * @summary Absolute total staked APR range
   */
  private calcStakedAprRange(
    unstakedTotalAPR: string,
    stakingBalApr: AprRange,
    stakingRewardApr = '0'
  ): AprRange {
    const stakedBaseAPR = bnum(unstakedTotalAPR).plus(stakingRewardApr);
    const maxBalApr = stakingBalApr?.max || '0';
    const minBalApr = stakingBalApr?.min || '0';

    return {
      max: stakedBaseAPR.plus(maxBalApr).toString(),
      min: stakedBaseAPR.plus(minBalApr).toString()
    };
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

  private async calcAdditionalAPR(prices: TokenPrices): Promise<Record<string, string>> {
    const aprs = {};
    if (
      isVeBalPool(this.pool.id) &&
      POOLS.IdsMap.bbAaveUSD &&
      TOKENS.Addresses.bbaUSD
    ) {
      const epochBeforeLast = toUnixTimestamp(getPreviousEpoch(1).getTime());
      const balAddress = getAddress(TOKENS.Addresses.BAL);
      const bbAUSDAddress = getAddress(TOKENS.Addresses.bbaUSD);

      const getBalDistribution = feeDistributor.getTokensDistributedInWeek(
        balAddress,
        epochBeforeLast
      );
      const getbbAUSDDistribution = feeDistributor.getTokensDistributedInWeek(
        bbAUSDAddress,
        epochBeforeLast
      );

      const [balAmount, bbAUSDAmount] = await Promise.all([
        getBalDistribution,
        getbbAUSDDistribution
      ]);

      const balPrice = prices[balAddress];
      const bbaUSDPrice = prices[bbAUSDAddress];
      console.log('prices', balPrice, bbaUSDPrice)

      console.log('Amounts', balAmount, bbAUSDAmount);
      aprs['veBalApr'] = '0.1';
    }
    return aprs;
  }
}
