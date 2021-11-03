import {
  SOR as SORV2,
  SwapInfo,
  SubgraphPoolBase,
  SwapTypes,
  SwapOptions,
  PoolFilter
} from '@balancer-labs/sor2';
import { SOR as SORV1 } from '@balancer-labs/sor';
import { BigNumber } from '@ethersproject/bignumber';
import { Provider } from '@ethersproject/providers';
import { AddressZero } from '@ethersproject/constants';
import OldBigNumber from 'bignumber.js';
import { Swap, Pool } from '@balancer-labs/sor/dist/types';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';

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
  marketSpNormalised: string;
  v1result: [Swap[][], BigNumber, OldBigNumber];
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
  private sorV1: SORV1;
  private sorV2: SORV2;
  private weth: string;
  private fetchStatus: FetchStatus = {
    v1finishedFetch: false,
    v2finishedFetch: false,
    v1success: false,
    v2success: false
  };
  private isV1Supported: boolean;
  private isFetching: boolean;
  maxPools: number;
  gasPrice: BigNumber;
  selectedPools: (SubgraphPoolBase | Pool)[] = [];

  constructor(
    isV1Supported: boolean,
    provider: Provider,
    gasPrice: BigNumber,
    maxPools: number,
    chainId: number,
    weth: string,
    poolsSourceV1: string,
    subgraphUrlV2: string
  ) {
    this.isV1Supported = isV1Supported;

    // Initialises SOR. Note they use different SOR packages.
    this.sorV1 = new SORV1(
      provider as any,
      new OldBigNumber(gasPrice.toString()),
      maxPools,
      chainId,
      poolsSourceV1
    );

    this.sorV2 = new SORV2(provider, chainId, subgraphUrlV2);
    this.weth = weth;
    this.gasPrice = gasPrice;
    this.maxPools = maxPools;
    this.isFetching = false;
  }

  // Uses SOR V2 to retrieve the cost & reuses for SOR V1 to save time (requires onchain call).
  // If previously called the cached value will be used.
  async setCostOutputToken(
    tokenAddr: string,
    tokenDecimals: number,
    manualCost: string | null = null
  ): Promise<BigNumber> {
    tokenAddr = tokenAddr === NATIVE_ASSET_ADDRESS ? this.weth : tokenAddr;

    if (manualCost) {
      await this.sorV2.swapCostCalculator.setNativeAssetPriceInToken(
        tokenAddr,
        manualCost
      );
    }

    const cost = await this.sorV2.getCostOfSwapInToken(
      tokenAddr,
      tokenDecimals,
      this.gasPrice,
      BigNumber.from(SWAP_COST)
    );

    console.log(`[SorManager] Cost for token ${tokenAddr}: ${cost.toString()}`);

    if (this.isV1Supported) {
      this.sorV1.setCostOutputToken(
        tokenAddr,
        new OldBigNumber(cost.toString())
      );
    }
    return cost;
  }

  // This fetches ALL pool with onchain info.
  async fetchPools(): Promise<void> {
    if (this.isFetching) {
      return;
    }
    this.isFetching = true;
    let v1fetch;
    console.log(`[SorManager] fetch Subgraph (V1:${this.isV1Supported})`);
    if (this.isV1Supported) {
      console.log('[SorManager] V1 fetchPools started');
      v1fetch = this.sorV1.fetchPools();
    }

    // This will catch any error fetching Subgraph or onChain data with V2
    console.time('[SorManager] V2 fetchPools');
    try {
      // Fetch of all pools from V2 subgraph and pull onchain data
      const v2result = await this.sorV2.fetchPools();
      this.fetchStatus.v2finishedFetch = true;
      this.fetchStatus.v2success = v2result;
    } catch (err) {
      console.log(
        `[SorManager] V2 fetchPools issue: ${(err as Error).message}`
      );
      this.fetchStatus.v2finishedFetch = true;
      this.fetchStatus.v2success = false;
    }
    console.log(
      `[SorManager] V2 fetchPools result: ${this.fetchStatus.v2success}`
    );
    console.timeEnd(`[SorManager] V2 fetchPools`);

    if (this.isV1Supported) {
      // This will catch any error with OnChain data with V1
      try {
        const v1result = await v1fetch;
        this.fetchStatus.v1finishedFetch = true;
        this.fetchStatus.v1success = v1result;
      } catch (err) {
        console.log(
          `[SorManager] V1 fetchPools issue: ${(err as Error).message}`
        );
        this.fetchStatus.v1finishedFetch = true;
        this.fetchStatus.v1success = false;
      }
      console.log(
        `[SorManager] V1 fetchPools result: ${this.fetchStatus.v1success}`
      );
    }

    this.selectedPools = this.sorV2.getPools();
    this.isFetching = false;
  }
  // Gets swaps for V1 & V2 liquidity and determined best result
  async getBestSwap(
    tokenIn: string,
    tokenOut: string,
    tokenInDecimals: number,
    tokenOutDecimals: number,
    swapType: SwapTypes,
    amountScaled: OldBigNumber,
    swapDecimals: number,
    liquiditySelection: LiquiditySelection
  ): Promise<SorReturn> {
    console.log(
      `[SorManager] getBestSwap: ${tokenIn}/${tokenOut} (Liq: ${liquiditySelection}) (V1: ${this.isV1Supported})`
    );

    const v1TokenIn = tokenIn === NATIVE_ASSET_ADDRESS ? this.weth : tokenIn;
    const v1TokenOut = tokenOut === NATIVE_ASSET_ADDRESS ? this.weth : tokenOut;

    let swapsV1: Swap[][] = [];
    let returnAmountV1 = new OldBigNumber(0);
    let marketSpV1Scaled = new OldBigNumber(0);
    let returnAmountV1ConsideringFees = new OldBigNumber(0);

    if (this.isV1Supported)
      [
        swapsV1,
        returnAmountV1,
        marketSpV1Scaled,
        returnAmountV1ConsideringFees
      ] = await this.sorV1.getSwaps(
        v1TokenIn.toLowerCase(),
        v1TokenOut.toLowerCase(),
        swapType === SwapTypes.SwapExactIn ? 'swapExactIn' : 'swapExactOut',
        amountScaled
      );

    const v2TokenIn = tokenIn === NATIVE_ASSET_ADDRESS ? AddressZero : tokenIn;
    const v2TokenOut =
      tokenOut === NATIVE_ASSET_ADDRESS ? AddressZero : tokenOut;

    const timestampSeconds = Math.floor(Date.now() / 1000);

    // The poolTypeFilter can be used to filter to different pool types. Useful for debug/testing.
    const swapOptions: SwapOptions = {
      maxPools: this.maxPools,
      gasPrice: this.gasPrice,
      swapGas: BigNumber.from(SWAP_COST),
      poolTypeFilter: PoolFilter.All,
      timestamp: timestampSeconds,
      forceRefresh: true
    };

    const swapInfoV2: SwapInfo = await this.sorV2.getSwaps(
      v2TokenIn.toLowerCase(),
      v2TokenOut.toLowerCase(),
      swapType,
      BigNumber.from(amountScaled.toString()),
      swapOptions
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

    if (swapType === SwapTypes.SwapExactIn) {
      return this.selectBestSwapIn(
        BigNumber.from(returnAmountV1.toString()),
        BigNumber.from(returnAmountV1ConsideringFees.toString()),
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
      return this.selectBestSwapOut(
        BigNumber.from(returnAmountV1.toString()),
        BigNumber.from(returnAmountV1ConsideringFees.toString()),
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

  private selectBestSwapIn(
    returnAmountV1: BigNumber,
    returnAmountV1ConsideringFees: BigNumber,
    marketSpV1Scaled: OldBigNumber,
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
      returnAmountV1ConsideringFees.lt(
        swapInfoV2.returnAmountConsideringFees.toString()
      )
    )
      isV1best = false;
    else isV1best = true;

    // Need to return marketSp as normalized
    const marketSpV1Normalised = marketSpV1Scaled
      .div(10 ** (18 + tokenInDecimals - tokenOutDecimals))
      .toString();

    const v1return: SorReturn = {
      isV1swap: true,
      isV1best,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      returnDecimals: tokenOutDecimals,
      hasSwaps: swapsV1.length > 0,
      returnAmount: BigNumber.from(returnAmountV1.toString()),
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
      console.log('[SorManager] V1 swap is best by liq.');
      this.selectedPools = this.sorV1.onChainCache.pools;
      return v1return;
    } else if (liquiditySelection === LiquiditySelection.V2) {
      console.log('[SorManager] V2 swap is best by liq.');
      this.selectedPools = this.sorV2.getPools();
      return v2return;
    }

    // Either V1 & V2 are both unlocked or both locked so return best option by value
    if (isV1best) {
      console.log('[SorManager] V1 swap is best.');
      this.selectedPools = this.sorV1.onChainCache.pools;
      return v1return;
    } else {
      console.log('[SorManager]  V2 swap is best.');
      this.selectedPools = this.sorV2.getPools();
      return v2return;
    }
  }

  private selectBestSwapOut(
    returnAmountV1: BigNumber,
    returnAmountV1ConsideringFees: BigNumber,
    marketSpV1Scaled: OldBigNumber,
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
        swapInfoV2.returnAmountConsideringFees.toString()
      );

    // Need to return marketSp as normalized
    const marketSpV1Normalised = marketSpV1Scaled
      .div(10 ** (18 + tokenInDecimals - tokenOutDecimals))
      .toString();

    const v1return: SorReturn = {
      isV1swap: true,
      isV1best,
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      returnDecimals: tokenInDecimals,
      hasSwaps: swapsV1.length > 0,
      returnAmount: BigNumber.from(returnAmountV1.toString()),
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
      console.log('[SorManager] V1 swap is best by liq.');
      this.selectedPools = this.sorV1.onChainCache.pools;
      return v1return;
    } else if (liquiditySelection === LiquiditySelection.V2) {
      console.log('[SorManager] V2 swap is best by liq.');
      this.selectedPools = this.sorV2.getPools();
      return v2return;
    }

    // Either V1 & V2 are both unlocked or both locked so return best option by value
    if (isV1best) {
      console.log('[SorManager] V1 swap is best.');
      this.selectedPools = this.sorV1.onChainCache.pools;
      return v1return;
    } else {
      console.log('[SorManager] V2 swap is best.');
      this.selectedPools = this.sorV2.getPools();
      return v2return;
    }
  }

  // Check if pool info fetch
  hasPoolData(): boolean {
    if (!this.isV1Supported && this.fetchStatus.v2finishedFetch) {
      if (this.fetchStatus.v2success === false) {
        console.log(
          `[SorManager] Error Fetching V2 Pools & V1 Not Supported - No Liquidity Sources.`
        );
        return false;
      } else return true;
    }

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
