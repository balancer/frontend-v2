import { getAddress } from 'ethers/lib/utils';

import { isStable, isStablePhantom, isWstETH } from '@/composables/usePool';
import { FiatCurrency } from '@/constants/currency';
import { bnSum, bnum } from '@/lib/utils';
import { calcUSDPlusWeightedAPR } from '@/lib/utils/apr.helper';
import {
  computeAPRsForPool,
  computeTotalAPRForPool,
  currentLiquidityMiningRewards
} from '@/lib/utils/liquidityMining';

import { aaveService } from '../aave/aave.service';
import { balancerSubgraphService } from '../balancer/subgraph/balancer-subgraph.service';
import {
  ExcludedAddresses,
  removeAddressesFromTotalLiquidity
} from '../balancer/subgraph/entities/pools/helpers';
import {
  AnyPool,
  LinearPool,
  Pool,
  PoolToken
} from '../balancer/subgraph/types';
import { TokenPrices } from '../coingecko/api/price.service';
import { lidoService } from '../lido/lido.service';
import LiquidityConcern from './concerns/liquidity.concern';

const IS_LIQUIDITY_MINING_ENABLED = true;
export default class PoolService {
  pool: AnyPool;
  liquidityConcern: LiquidityConcern;

  constructor(pool: AnyPool, liquidityConcernClass = LiquidityConcern) {
    this.pool = pool;
    this.liquidityConcern = new liquidityConcernClass(this);
  }

  public calcTotalLiquidity(
    prices: TokenPrices,
    currency: FiatCurrency
  ): string {
    try {
      return this.liquidityConcern.calcTotal(prices, currency);
    } catch (error) {
      console.error('Failed to calc pool liquidity:', error);
      return '0';
    }
  }

  /**
   * fetches StablePhantom linear pools and extracts
   * required attributes.
   */
  public async decorateWithLinearPoolAttrs(): Promise<AnyPool> {
    // Fetch linear pools from subgraph
    const linearPools = (await balancerSubgraphService.pools.get(
      {
        where: {
          address_in: this.pool.tokensList,
          totalShares_gt: -1 // Avoid the filtering for low liquidity pools
        }
      },
      { mainIndex: true, wrappedIndex: true }
    )) as LinearPool[];

    const linearPoolTokensMap: Pool['linearPoolTokensMap'] = {};

    // Inject main/wrapped tokens into pool schema
    linearPools.forEach(linearPool => {
      if (!this.pool.mainTokens) this.pool.mainTokens = [];
      if (!this.pool.wrappedTokens) this.pool.wrappedTokens = [];

      const index = this.pool.tokensList.indexOf(
        linearPool.address.toLowerCase()
      );

      this.pool.mainTokens[index] = getAddress(
        linearPool.tokensList[linearPool.mainIndex]
      );
      this.pool.wrappedTokens[index] = getAddress(
        linearPool.tokensList[linearPool.wrappedIndex]
      );

      linearPool.tokens
        .filter(token => token.address !== linearPool.address)
        .forEach(token => {
          const address = getAddress(token.address);

          linearPoolTokensMap[address] = {
            ...token,
            address
          };
        });
    });

    this.pool.linearPoolTokensMap = linearPoolTokensMap;
    return this.pool;
  }

  removePreMintedBPT(): AnyPool {
    const poolAddress = balancerSubgraphService.pools.addressFor(this.pool.id);
    // Remove pre-minted BPT token if exits
    this.pool.tokensList = this.pool.tokensList.filter(
      address => address !== poolAddress.toLowerCase()
    );
    return this.pool;
  }

  calcLiquidityMiningAPR(prices: TokenPrices, currency: FiatCurrency) {
    let liquidityMiningAPR = '0';
    let liquidityMiningBreakdown = {};

    const liquidityMiningRewards = currentLiquidityMiningRewards[this.pool.id];

    const hasLiquidityMiningRewards = IS_LIQUIDITY_MINING_ENABLED
      ? !!liquidityMiningRewards
      : false;

    if (hasLiquidityMiningRewards) {
      liquidityMiningAPR = computeTotalAPRForPool(
        liquidityMiningRewards,
        prices,
        currency,
        this.pool.miningTotalLiquidity
      );
      liquidityMiningBreakdown = computeAPRsForPool(
        liquidityMiningRewards,
        prices,
        currency,
        this.pool.miningTotalLiquidity
      );
    }

    return {
      hasLiquidityMiningRewards,
      liquidityMiningAPR,
      liquidityMiningBreakdown
    };
  }

  formatPoolTokens(): PoolToken[] {
    const tokens = this.pool.tokens.map(token => ({
      ...token,
      address: getAddress(token.address)
    }));

    if (isStable(this.pool.poolType)) return tokens;

    return tokens.sort((a, b) => parseFloat(b.weight) - parseFloat(a.weight));
  }

  removeExcludedAddressesFromTotalLiquidity(
    totalLiquidityString: string,
    excludedAddresses: ExcludedAddresses
  ) {
    return removeAddressesFromTotalLiquidity(
      excludedAddresses,
      this.pool,
      totalLiquidityString
    );
  }

  async calcThirdPartyAPR(
    prices: TokenPrices,
    currency: FiatCurrency,
    protocolFeePercentage: number
  ) {
    console.log('dingling', {
      prices,
      currency,
      protocolFeePercentage,
      pool: this.pool.tokenAddresses
    })
    let thirdPartyAPR = '0';
    let thirdPartyAPRBreakdown = {};
    if (isWstETH(this.pool)) {
      thirdPartyAPR = await lidoService.calcStEthAPRFor(
        this.pool,
        protocolFeePercentage
      );
    } else if (isStablePhantom(this.pool.poolType)) {
      const aaveAPR = await aaveService.calcWeightedSupplyAPRFor(
        this.pool,
        prices,
        currency
      );
      let { total } = aaveAPR;
      const { breakdown } = aaveAPR;

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

      thirdPartyAPR = total;
      thirdPartyAPRBreakdown = breakdown;
    }

    return {
      thirdPartyAPR,
      thirdPartyAPRBreakdown
    };
  }

  calcAPR(pastPool: Pool | undefined, protocolFeePercentage: number) {
    if (!pastPool)
      return bnum(this.pool.totalSwapFee)
        .times(1 - protocolFeePercentage)
        .dividedBy(this.pool.totalLiquidity)
        .multipliedBy(365)
        .toString();

    const swapFees = bnum(this.pool.totalSwapFee).minus(pastPool.totalSwapFee);
    return swapFees
      .times(1 - protocolFeePercentage)
      .dividedBy(this.pool.totalLiquidity)
      .multipliedBy(365)
      .toString();
  }

  calcFees(pastPool: Pool | undefined): string {
    if (!pastPool) return this.pool.totalSwapFee;

    return bnum(this.pool.totalSwapFee)
      .minus(pastPool.totalSwapFee)
      .toString();
  }
}
