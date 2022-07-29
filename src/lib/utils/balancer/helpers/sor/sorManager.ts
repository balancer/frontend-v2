import {
  PoolFilter,
  SOR as SORV2,
  SubgraphPoolBase,
  SwapInfo,
  SwapOptions,
  SwapTypes,
} from '@balancer-labs/sdk';
import { Pool } from '@balancer-labs/sor/dist/types';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { Provider } from '@ethersproject/providers';
import OldBigNumber from 'bignumber.js';

import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { balancer } from '@/lib/balancer.sdk';

const SWAP_COST = process.env.VUE_APP_SWAP_COST || '100000';

export interface SorReturn {
  tokenIn: string;
  tokenOut: string;
  returnDecimals: number;
  hasSwaps: boolean;
  returnAmount: BigNumber;
  marketSpNormalised: string;
  result: SwapInfo;
}

interface FetchStatus {
  v2finishedFetch: boolean;
  v2success: boolean;
}

/*
Aims to manage liquidity using SOR.
*/
export class SorManager {
  private sorV2: SORV2;
  private weth: string;
  private fetchStatus: FetchStatus = {
    v2finishedFetch: false,
    v2success: false,
  };
  private isFetching: boolean;
  maxPools: number;
  gasPrice: BigNumber;
  selectedPools: (SubgraphPoolBase | Pool)[] = [];

  constructor(
    provider: Provider,
    gasPrice: BigNumber,
    maxPools: number,
    chainId: number,
    weth: string
  ) {
    this.sorV2 = balancer.sor;
    this.weth = weth;
    this.gasPrice = gasPrice;
    this.maxPools = maxPools;
    this.isFetching = false;
  }

  // Uses SOR V2 to retrieve the cost
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

    return cost;
  }

  // This fetches ALL pool with onchain info.
  async fetchPools(): Promise<void> {
    if (this.isFetching) {
      return;
    }
    this.isFetching = true;

    // This will catch any error fetching Subgraph or onChain data with V2
    console.time('[SorManager] fetchPools');
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

    this.selectedPools = this.sorV2.getPools();
    this.isFetching = false;
  }
  // Format best swap result
  async getBestSwap(
    tokenIn: string,
    tokenOut: string,
    tokenInDecimals: number,
    tokenOutDecimals: number,
    swapType: SwapTypes,
    amountScaled: OldBigNumber
  ): Promise<SorReturn> {
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
      forceRefresh: true,
    };

    const swapInfoV2: SwapInfo = await this.sorV2.getSwaps(
      v2TokenIn.toLowerCase(),
      v2TokenOut.toLowerCase(),
      swapType,
      BigNumber.from(amountScaled.toString()),
      swapOptions
    );

    // Both are scaled amounts
    console.log(
      `[SorManager] ${swapInfoV2.returnAmount.toString()}: V2 return amount`
    );
    console.log(
      `[SorManager] ${swapInfoV2.returnAmountConsideringFees.toString()}: V2 return amount with fees`
    );

    return {
      tokenIn,
      tokenOut,
      returnDecimals:
        swapType === SwapTypes.SwapExactIn ? tokenOutDecimals : tokenInDecimals,
      hasSwaps: swapInfoV2.swaps.length > 0,
      returnAmount: swapInfoV2.returnAmount,
      result: swapInfoV2,
      marketSpNormalised: swapInfoV2.marketSp,
    };
  }

  // Check if pool info fetch
  hasPoolData(): boolean {
    if (this.fetchStatus.v2finishedFetch) {
      // TO DO - This could be used to provide more info to UI?
      if (this.fetchStatus.v2success === false) {
        console.log(
          `[SorManager] Error Fetching V2 Pools - No Liquidity Sources.`
        );
        return false;
      }

      return true;
    } else {
      console.log(`[SorManager] Not finished fetching pools.`);
      return false;
    }
  }
}
