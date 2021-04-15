import {
  SOR as SORV2,
  SwapInfo,
  DisabledOptions,
  SubGraphPoolsBase,
  SwapTypes,
  fetchSubgraphPools
} from '@balancer-labs/sor2';
import { SOR as SORV1 } from '@balancer-labs/sor';
import { BaseProvider } from '@ethersproject/providers';
import { AddressZero } from '@ethersproject/constants';
import BigNumber from 'bignumber.js';
import { scale } from '@/utils';
import { Swap, Pools } from '@balancer-labs/sor/dist/types';
import { ETHER } from '@/constants/tokenlists';

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
  selectedPools: SubGraphPoolsBase | Pools = { pools: [] };
  weth: string;
  subgraphUrl: string;

  constructor(
    provider: BaseProvider,
    gasPrice: BigNumber,
    maxPools: number,
    chainId: number,
    weth: string,
    poolsSourceV1: string,
    poolsSourceV2: SubGraphPoolsBase | string,
    subgraphUrl: string,
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
    this.weth = weth;
    this.subgraphUrl = subgraphUrl;
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
    console.time(`[SorManager] fetch Subgraph`);
    const subgraphFetch = fetchSubgraphPools(this.subgraphUrl);
    console.log('[SorManager] V1 fetchPools started');
    const v1fetch = this.sorV1.fetchPools();
    const subgraphPools = await subgraphFetch;
    console.timeEnd('[SorManager] fetch Subgraph');
    console.time('[SorManager] V2 fetchPools');
    // Use Subgraph pools data and fetch onChain
    const v2result = await this.sorV2.fetchPools(true, subgraphPools);
    console.timeEnd(`[SorManager] V2 fetchPools`);
    console.log(`[SorManager] V2 fetchPools result: ${v2result}`);
    const v1result = await v1fetch;
    console.log(`[SorManager] V1 fetchPools result: ${v1result}`);
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
    console.log(tokenIn);
    console.log(tokenOut);
    // V2 uses normalised values. V1 uses scaled values.
    const amountNormalised = scale(amountScaled, -swapDecimals);

    const v1TokenIn = tokenIn === ETHER.address ? this.weth : tokenIn;
    const v1TokenOut = tokenOut === ETHER.address ? this.weth : tokenOut;

    const [
      swapsV1,
      returnAmountV1,
      marketSpV1Scaled
    ] = await this.sorV1.getSwaps(
      v1TokenIn.toLowerCase(),
      v1TokenOut.toLowerCase(),
      swapType,
      amountScaled
    );

    const v2TokenIn = tokenIn === ETHER.address ? AddressZero : tokenIn;
    const v2TokenOut = tokenOut === ETHER.address ? AddressZero : tokenOut;

    const swapTypeV2: SwapTypes =
      swapType === 'swapExactIn'
        ? SwapTypes.SwapExactIn
        : SwapTypes.SwapExactOut;

    const swapInfoV2: SwapInfo = await this.sorV2.getSwaps(
      v2TokenIn.toLowerCase(),
      v2TokenOut.toLowerCase(),
      swapTypeV2,
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
