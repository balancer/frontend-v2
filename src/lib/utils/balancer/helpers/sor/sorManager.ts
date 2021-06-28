import {
  SOR as SORV2,
  SwapInfo,
  DisabledOptions,
  SubGraphPoolsBase,
  SubgraphPoolBase,
  SwapTypes,
  fetchSubgraphPools
} from '@balancer-labs/sor2';
import { SOR as SORV1 } from '@balancer-labs/sor';
import { BaseProvider } from '@ethersproject/providers';
import { AddressZero } from '@ethersproject/constants';
import BigNumber from 'bignumber.js';
import { scale } from '@/lib/utils';
import { Swap, Pool } from '@balancer-labs/sor/dist/types';
import { ETHER } from '@/constants/tokenlists';

const SWAP_COST = process.env.VUE_APP_SWAP_COST || '100000';

export enum LiquiditySelection {
  Best = 'best',
  V1 = 'v1',
  V2 = 'v2'
}

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

interface FetchStatus {
  v1finishedFetch: boolean;
  v2finishedFetch: boolean;
  v1success: boolean;
  v2success: boolean;
}

/*
Aims to manage liquidity between V1 & V2 using SOR.
*/
export class SorManager {
  sorV1: SORV1;
  sorV2: SORV2;
  selectedPools: (SubgraphPoolBase | Pool)[] = [];
  weth: string;
  subgraphUrl: string;
  fetchStatus: FetchStatus = {
    v1finishedFetch: false,
    v2finishedFetch: false,
    v1success: false,
    v2success: false
  };

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
      new BigNumber(SWAP_COST),
      disabledOptions
    );
    this.weth = weth;
    this.subgraphUrl = subgraphUrl;
  }

  // Uses SOR V2 to retrieve the cost & reuses for SOR V1 to save time (requires onchain call).
  // If previously called the cached value will be used.
  async setCostOutputToken(
    tokenAddr: string,
    tokenDecimals: number,
    manualCost: BigNumber | null = null
  ): Promise<BigNumber> {
    tokenAddr = tokenAddr === ETHER.address ? this.weth : tokenAddr;

    let cost = this.sorV2.tokenCost[tokenAddr.toLowerCase()];
    if (cost) {
      console.log(
        `[SorManager] Cost for token ${tokenAddr} (cache): ${cost.toString()}`
      );
    } else {
      if (manualCost) {
        cost = await this.sorV2.setCostOutputToken(
          tokenAddr,
          tokenDecimals,
          manualCost
        );
        console.log(
          `[SorManager] Cost for token ${tokenAddr} (new manual): ${cost.toString()}`
        );
      } else {
        cost = await this.sorV2.setCostOutputToken(tokenAddr, tokenDecimals);
        console.log(
          `[SorManager] Cost for token ${tokenAddr} (new): ${cost.toString()}`
        );
      }
    }
    this.sorV1.setCostOutputToken(
      tokenAddr,
      cost.times(new BigNumber(10 ** tokenDecimals))
    );
    return cost;
  }

  // This fetches ALL pool with onchain info.
  async fetchPools(): Promise<void> {
    console.log(`[SorManager] fetch Subgraph`);
    const subgraphFetch = fetchSubgraphPools(this.subgraphUrl);
    console.log('[SorManager] V1 fetchPools started');
    const v1fetch = this.sorV1.fetchPools();
    let subgraphPools;
    // This will catch any error fetching Subgraph or onChain data with V2
    try {
      subgraphPools = await subgraphFetch;
      console.log('[SorManager] Subgraph fetched');
      console.time('[SorManager] V2 fetchPools');
      // Use Subgraph pools data and fetch onChain
      const v2result = await this.sorV2.fetchPools(true, subgraphPools);
      this.fetchStatus.v2finishedFetch = true;
      this.fetchStatus.v2success = v2result;
    } catch (err) {
      console.log(`[SorManager] V2 fetchPools issue: ${err.message}`);
      this.fetchStatus.v2finishedFetch = true;
      this.fetchStatus.v2success = false;
    }
    console.log(
      `[SorManager] V2 fetchPools result: ${this.fetchStatus.v2success}`
    );
    console.timeEnd(`[SorManager] V2 fetchPools`);

    // This will catch any error with OnChain data with V1
    try {
      const v1result = await v1fetch;
      this.fetchStatus.v1finishedFetch = true;
      this.fetchStatus.v1success = v1result;
    } catch (err) {
      console.log(`[SorManager] V1 fetchPools issue: ${err.message}`);
      this.fetchStatus.v1finishedFetch = true;
      this.fetchStatus.v1success = false;
    }
    console.log(
      `[SorManager] V1 fetchPools result: ${this.fetchStatus.v1success}`
    );

    this.selectedPools = this.sorV2.onChainBalanceCache.pools;
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
    liquiditySelection: LiquiditySelection
  ): Promise<SorReturn> {
    console.log(
      `[SorManager] getBestSwap: ${tokenIn}/${tokenOut} ${liquiditySelection}`
    );
    // V2 uses normalised values. V1 uses scaled values.
    const amountNormalised = scale(amountScaled, -swapDecimals);

    const v1TokenIn = tokenIn === ETHER.address ? this.weth : tokenIn;
    const v1TokenOut = tokenOut === ETHER.address ? this.weth : tokenOut;

    const [
      swapsV1,
      returnAmountV1,
      marketSpV1Scaled,
      returnAmountV1ConsideringFees
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

    const timestampSeconds = Math.floor(Date.now() / 1000);

    const swapInfoV2: SwapInfo = await this.sorV2.getSwaps(
      v2TokenIn.toLowerCase(),
      v2TokenOut.toLowerCase(),
      swapTypeV2,
      amountNormalised,
      timestampSeconds
    );

    // Both are scaled amounts
    console.log(`[SorManager] ${returnAmountV1.toString()}: V1 return amount`);
    console.log(
      `[SorManager] ${returnAmountV1ConsideringFees.toString()}: V1 return amount with fees`
    );
    console.log(
      `[SorManager] ${swapInfoV2.returnAmount.toString()}: V2 return amount`
    );
    console.log(
      `[SorManager] ${swapInfoV2.returnAmountConsideringFees.toString()}: V2 return amount with fees`
    );

    if (swapType === 'swapExactIn') {
      return this.getBestSwapIn(
        returnAmountV1,
        returnAmountV1ConsideringFees,
        marketSpV1Scaled,
        swapsV1,
        swapInfoV2,
        tokenIn,
        tokenInDecimals,
        tokenOut,
        tokenOutDecimals,
        liquiditySelection
      );
    } else {
      return this.getBestSwapOut(
        returnAmountV1,
        returnAmountV1ConsideringFees,
        marketSpV1Scaled,
        swapsV1,
        swapInfoV2,
        tokenIn,
        tokenInDecimals,
        tokenOut,
        tokenOutDecimals,
        liquiditySelection
      );
    }
  }

  getBestSwapIn(
    returnAmountV1: BigNumber,
    returnAmountV1ConsideringFees: BigNumber,
    marketSpV1Scaled: BigNumber,
    swapsV1: Swap[][],
    swapInfoV2: SwapInfo,
    tokenIn: string,
    tokenInDecimals: number,
    tokenOut: string,
    tokenOutDecimals: number,
    liquiditySelection: LiquiditySelection
  ): SorReturn {
    // For swapExactIn the highest return is best
    let isV1best: boolean;
    if (returnAmountV1.isZero()) isV1best = false;
    else if (swapInfoV2.swapAmount.isZero()) isV1best = true;
    else if (
      returnAmountV1ConsideringFees.lt(swapInfoV2.returnAmountConsideringFees)
    )
      isV1best = false;
    else isV1best = true;

    // Need to return marketSp as normalized
    const marketSpV1Normalised: BigNumber = marketSpV1Scaled.div(
      10 ** (18 + tokenInDecimals - tokenOutDecimals)
    );

    const v1return: SorReturn = {
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

    const v2return: SorReturn = {
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

    if (liquiditySelection === LiquiditySelection.V1) {
      console.log('[SorManager] V1 swap is best by manual choice.');
      this.selectedPools = this.sorV1.onChainCache.pools;
      return v1return;
    } else if (liquiditySelection === LiquiditySelection.V2) {
      console.log('[SorManager] V2 swap is best by manual choice.');
      this.selectedPools = this.sorV2.onChainBalanceCache.pools;
      return v2return;
    }

    // Either V1 & V2 are both unlocked or both locked so return best option by value
    if (isV1best) {
      console.log('[SorManager] V1 swap is best.');
      this.selectedPools = this.sorV1.onChainCache.pools;
      return v1return;
    } else {
      console.log('[SorManager]  V2 swap is best.');
      this.selectedPools = this.sorV2.onChainBalanceCache.pools;
      return v2return;
    }
  }

  getBestSwapOut(
    returnAmountV1: BigNumber,
    returnAmountV1ConsideringFees: BigNumber,
    marketSpV1Scaled: BigNumber,
    swapsV1: Swap[][],
    swapInfoV2: SwapInfo,
    tokenIn: string,
    tokenInDecimals: number,
    tokenOut: string,
    tokenOutDecimals: number,
    liquiditySelection: LiquiditySelection
  ): SorReturn {
    // swapExactOut cases
    // For swapExactOut the lowest return is best if > 0
    let isV1best: boolean;
    if (returnAmountV1.isZero() && swapInfoV2.returnAmount.isZero())
      isV1best = true;
    // This doesn't actually matter but rules out 0 values for next cases
    else if (returnAmountV1.isZero()) isV1best = false;
    else if (swapInfoV2.returnAmount.isZero()) isV1best = true;
    else
      isV1best = returnAmountV1ConsideringFees.lt(
        swapInfoV2.returnAmountConsideringFees
      );

    // Need to return marketSp as normalized
    const marketSpV1Normalised: BigNumber = marketSpV1Scaled.div(
      10 ** (18 + tokenInDecimals - tokenOutDecimals)
    );

    const v1return: SorReturn = {
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

    const v2return: SorReturn = {
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

    if (liquiditySelection === LiquiditySelection.V1) {
      console.log('[SorManager] V1 swap is best by manual choice.');
      this.selectedPools = this.sorV1.onChainCache.pools;
      return v1return;
    } else if (liquiditySelection === LiquiditySelection.V2) {
      console.log('[SorManager] V2 swap is best by manual choice.');
      this.selectedPools = this.sorV2.onChainBalanceCache.pools;
      return v2return;
    }

    // Either V1 & V2 are both unlocked or both locked so return best option by value
    if (isV1best) {
      console.log('[SorManager] V1 swap is best.');
      this.selectedPools = this.sorV1.onChainCache.pools;
      return v1return;
    } else {
      console.log('[SorManager] V2 swap is best.');
      this.selectedPools = this.sorV2.onChainBalanceCache.pools;
      return v2return;
    }
  }

  // Check if pool info fetch
  hasPoolData(): boolean {
    if (this.fetchStatus.v1finishedFetch && this.fetchStatus.v2finishedFetch) {
      // TO DO - This could be used to provide more info to UI?
      if (
        this.fetchStatus.v1success === false &&
        this.fetchStatus.v2success === false
      ) {
        console.log(
          `[SorManager] Error Fetching V1 & V2 Pools - No Liquidity Sources.`
        );
        return false;
      } else if (this.fetchStatus.v1success === false)
        console.log(
          `[SorManager] Error Fetching V1 Pools - Using V2 Liquidity Only.`
        );
      else if (this.fetchStatus.v2success === false)
        console.log(
          `[SorManager] Error Fetching V2 Pools - Using V1 Liquidity Only.`
        );

      return true;
    } else {
      console.log(`[SorManager] Not finished fetching pools.`);
      return false;
    }
  }
}
