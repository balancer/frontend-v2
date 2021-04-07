import { SOR as SORV2 } from 'sorv2package';
import { SOR as SORV1 } from '@balancer-labs/sor';
import { BaseProvider } from '@ethersproject/providers';
import BigNumber from 'bignumber.js';
import { scale } from '@/utils';
import {
  SubGraphPools,
  DisabledOptions,
  SwapInfo
} from 'sorv2package/dist/types';
import { Swap, Pools } from '@balancer-labs/sor/dist/types';

export interface SorReturn {
  isV1swap: boolean;
  isV1best: boolean;
  tokenIn: string;
  tokenOut: string;
  returnDecimals: number;
  hasSwaps: boolean;
  returnAmount: BigNumber;
  marketSpNormalised: BigNumber;
  v1result: [Swap[][], BigNumber, BigNumber];
  v2result: SwapInfo;
}

/*
Aims to manage liquidity between V1 & V2 using SOR.
*/
export class SorManager {
  sorV1: SORV1;
  sorV2: SORV2;
  selectedPools: SubGraphPools | Pools = { pools: [] };

  constructor(
    provider: BaseProvider,
    gasPrice: BigNumber,
    maxPools: number,
    chainId: number,
    poolsSourceV1: string,
    poolsSourceV2: string | SubGraphPools,
    disabledOptions: DisabledOptions = {
      isOverRide: false,
      disabledTokens: []
    }
  ) {
    // Initialises SOR. Note they use different SOR packages.
    this.sorV1 = new SORV1(
      provider,
      gasPrice,
      maxPools,
      chainId,
      poolsSourceV1
    );

    this.sorV2 = new SORV2(
      provider,
      gasPrice,
      maxPools,
      chainId,
      poolsSourceV2,
      disabledOptions
    );
  }

  // Uses SOR V2 to retrieve the cost & reuses for SOR V1 to save time (requires onchain call).
  async setCostOutputToken(tokenAddr: string): Promise<void> {
    console.log('[SorManager] setCostOutputToken');
    const cost: BigNumber = await this.sorV2.setCostOutputToken(tokenAddr);
    this.sorV1.setCostOutputToken(tokenAddr, cost);
  }

  // filtered calls are a quicker method, retrieving only onchain info for pools of interest
  async fetchFilteredPairPools(
    tokenIn: string,
    tokenOut: string
  ): Promise<void> {
    tokenIn = tokenIn.toLowerCase();
    tokenOut = tokenOut.toLowerCase();
    console.log('[SorManager] V1 fetchFilteredPairPools started.');
    const v1fetch = this.sorV1.fetchFilteredPairPools(tokenIn, tokenOut);
    console.log('[SorManager] V2 fetchFilteredPairPools started');
    const v2result = await this.sorV2.fetchFilteredPairPools(tokenIn, tokenOut);
    console.log(`[SorManager] V2 fetchFilteredPairPools done: ${v2result}`);
    const v1result = await v1fetch;
    console.log(`[SorManager] V1 fetchFilteredPairPools done: ${v1result}`);
    // TO DO - This is used by GasReimbursement but may not be needed?
    this.selectedPools = this.sorV2.onChainBalanceCache;
  }

  // This fetches ALL pool with onchain info.
  async fetchPools(): Promise<void> {
    console.log('[SorManager] V1 fetchPools started');
    const v1fetch = this.sorV1.fetchPools();
    console.log('[SorManager] V2 fetchPools started');
    const v2result = await this.sorV2.fetchPools();
    console.log(`[SorManager] V2 fetchPools done ${v2result}`);
    const v1result = await v1fetch;
    console.log(`[SorManager] V1 fetchPools done ${v1result}`);
    this.selectedPools = this.sorV2.onChainBalanceCache;
  }

  // Gets swaps for V1 & V2 liquidity and determined best result
  async getBestSwap(
    tokenIn: string,
    tokenOut: string,
    tokenInDecimals: number,
    tokenOutDecimals: number,
    swapType: string,
    amountScaled: BigNumber,
    swapDecimals: number,
    isUnlockedV1: boolean,
    isUnlockedV2: boolean
  ): Promise<SorReturn> {
    // V2 uses normalised values. V1 uses scaled values.
    const amountNormalised = scale(amountScaled, -swapDecimals);

    const [
      swapsV1,
      returnAmountV1,
      marketSpV1Scaled
    ] = await this.sorV1.getSwaps(
      tokenIn.toLowerCase(),
      tokenOut.toLowerCase(),
      swapType,
      amountScaled
    );

    const swapInfoV2: SwapInfo = await this.sorV2.getSwaps(
      tokenIn.toLowerCase(),
      tokenOut.toLowerCase(),
      swapType,
      amountNormalised
    );

    // Both are scaled amounts
    console.log(`[SorManager] V1 return amount: ${returnAmountV1.toString()}`);
    console.log(
      `[SorManager] V2 return amount: ${swapInfoV2.returnAmount.toString()}`
    );

    if (swapType === 'swapExactIn') {
      // For swapExactIn the highest return is best
      const isV1best = returnAmountV1.gt(swapInfoV2.returnAmount);

      // Need to return marketSp as normalized
      const marketSpV1Normalised: BigNumber = marketSpV1Scaled.div(
        10 ** (18 + tokenInDecimals - tokenOutDecimals)
      );

      // Allowances take initial priority for best swap
      if (isUnlockedV1 && !isUnlockedV2) {
        console.log('[SorManager] V1 swap is best by allowance.');
        this.selectedPools = this.sorV1.onChainCache;

        return {
          isV1swap: true,
          isV1best,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          returnDecimals: tokenOutDecimals,
          hasSwaps: swapsV1.length > 0,
          returnAmount: returnAmountV1,
          v1result: [swapsV1, returnAmountV1, marketSpV1Scaled],
          v2result: swapInfoV2,
          marketSpNormalised: marketSpV1Normalised
        };
      }

      if (!isUnlockedV1 && isUnlockedV2) {
        console.log('[SorManager] V2 swap is best by allowance.');
        this.selectedPools = this.sorV2.onChainBalanceCache;

        return {
          isV1swap: false,
          isV1best,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          returnDecimals: tokenOutDecimals,
          hasSwaps: swapInfoV2.swaps.length > 0,
          returnAmount: swapInfoV2.returnAmount,
          v1result: [swapsV1, returnAmountV1, marketSpV1Scaled],
          v2result: swapInfoV2,
          marketSpNormalised: swapInfoV2.marketSp
        };
      }

      // Either V1 & V2 are both unlocked or both locked so return best option by value
      if (isV1best) {
        console.log('[SorManager] V1 swap is best.');
        this.selectedPools = this.sorV1.onChainCache;

        return {
          isV1swap: true,
          isV1best,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          returnDecimals: tokenOutDecimals,
          hasSwaps: swapsV1.length > 0,
          returnAmount: returnAmountV1,
          v1result: [swapsV1, returnAmountV1, marketSpV1Scaled],
          v2result: swapInfoV2,
          marketSpNormalised: marketSpV1Normalised
        };
      } else {
        console.log('[SorManager]  V2 swap is best.');
        this.selectedPools = this.sorV2.onChainBalanceCache;

        return {
          isV1swap: false,
          isV1best,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          returnDecimals: tokenOutDecimals,
          hasSwaps: swapInfoV2.swaps.length > 0,
          returnAmount: swapInfoV2.returnAmount,
          v1result: [swapsV1, returnAmountV1, marketSpV1Scaled],
          v2result: swapInfoV2,
          marketSpNormalised: swapInfoV2.marketSp
        };
      }
    } else {
      // swapExactOut cases
      // For swapExactOut the lowest return is best if > 0
      let isV1best: boolean;
      if (returnAmountV1.isZero() && swapInfoV2.returnAmount.isZero())
        isV1best = true;
      // This doesn't actually matter but rules out 0 values for next cases
      else if (returnAmountV1.isZero()) isV1best = false;
      else if (swapInfoV2.returnAmount.isZero()) isV1best = true;
      else isV1best = returnAmountV1.lt(swapInfoV2.returnAmount);

      // Need to return marketSp as normalized
      const marketSpV1Normalised: BigNumber = marketSpV1Scaled.div(
        10 ** (18 + tokenInDecimals - tokenOutDecimals)
      );

      // Allowances take initial priority for best swap
      if (isUnlockedV1 && !isUnlockedV2) {
        console.log('[SorManager] V1 swap is best by allowance.');
        this.selectedPools = this.sorV1.onChainCache;

        return {
          isV1swap: true,
          isV1best,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          returnDecimals: tokenInDecimals,
          hasSwaps: swapsV1.length > 0,
          returnAmount: returnAmountV1,
          v1result: [swapsV1, returnAmountV1, marketSpV1Scaled],
          v2result: swapInfoV2,
          marketSpNormalised: marketSpV1Normalised
        };
      }

      if (!isUnlockedV1 && isUnlockedV2) {
        console.log('[SorManager] V2 swap is best by allowance.');
        this.selectedPools = this.sorV2.onChainBalanceCache;

        return {
          isV1swap: false,
          isV1best,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          returnDecimals: tokenInDecimals,
          hasSwaps: swapInfoV2.swaps.length > 0,
          returnAmount: swapInfoV2.returnAmount,
          v1result: [swapsV1, returnAmountV1, marketSpV1Scaled],
          v2result: swapInfoV2,
          marketSpNormalised: swapInfoV2.marketSp
        };
      }

      // Either V1 & V2 are both unlocked or both locked so return best option by value
      if (isV1best) {
        console.log('[SorManager] V1 swap is best.');
        this.selectedPools = this.sorV1.onChainCache;

        return {
          isV1swap: true,
          isV1best,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          returnDecimals: tokenInDecimals,
          hasSwaps: swapsV1.length > 0,
          returnAmount: returnAmountV1,
          v1result: [swapsV1, returnAmountV1, marketSpV1Scaled],
          v2result: swapInfoV2,
          marketSpNormalised: marketSpV1Normalised
        };
      } else {
        console.log('[SorManager] V2 swap is best.');
        this.selectedPools = this.sorV2.onChainBalanceCache;

        return {
          isV1swap: false,
          isV1best,
          tokenIn: tokenIn,
          tokenOut: tokenOut,
          returnDecimals: tokenInDecimals,
          hasSwaps: swapInfoV2.swaps.length > 0,
          returnAmount: swapInfoV2.returnAmount,
          v1result: [swapsV1, returnAmountV1, marketSpV1Scaled],
          v2result: swapInfoV2,
          marketSpNormalised: swapInfoV2.marketSp
        };
      }
    }
  }

  // Check if pair data already fetched (using fetchFilteredPairPools)
  hasDataForPair(tokenIn: string, tokenOut: string): boolean {
    return (
      this.sorV1.hasDataForPair(tokenIn, tokenOut) &&
      this.sorV2.hasDataForPair(tokenIn, tokenOut)
    );
  }
}
