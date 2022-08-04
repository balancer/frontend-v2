import {
  BatchSwapStep,
  FundManagement,
  SingleSwap,
  SwapType,
  SwapV2,
} from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';

import { isSameAddress } from '@/lib/utils';
import { getWstETHByStETH, isStETH } from '@/lib/utils/balancer/lido';
import ConfigService, { configService } from '@/services/config/config.service';
import { lidoRelayerService } from '@/services/contracts/lido-relayer.service';
import { vaultService } from '@/services/contracts/vault.service';

import Web3Service, { web3Service } from '../web3/web3.service';

export type Address = string;

export enum SwapTokenType {
  fixed,
  min,
  max,
}

export interface SwapToken {
  address: Address;
  amount: BigNumber;
  type: SwapTokenType;
}

export default class SwapService {
  constructor(
    private readonly config: ConfigService = configService,
    private readonly web3: Web3Service = web3Service
  ) {}

  public async batchSwapV2(
    tokenIn: SwapToken,
    tokenOut: SwapToken,
    swaps: SwapV2[],
    tokenAddresses: string[]
  ): Promise<TransactionResponse> {
    if (isStETH(tokenIn.address, tokenOut.address)) {
      return this.lidoBatchSwap(tokenIn, tokenOut, swaps, tokenAddresses);
    }
    console.log('[Swap Service] batchSwapV2');
    const overrides: any = {};

    if (isSameAddress(tokenIn.address, AddressZero)) {
      overrides.value = tokenIn.amount;
    }

    const swapKind =
      tokenOut.type === SwapTokenType.min
        ? SwapType.SwapExactIn
        : SwapType.SwapExactOut;

    const funds = await this.getFundManagement();

    try {
      if (swaps.length == 1) {
        const single: SingleSwap = {
          poolId: swaps[0].poolId,
          kind: swapKind,
          assetIn: tokenAddresses[swaps[0].assetInIndex],
          assetOut: tokenAddresses[swaps[0].assetOutIndex],
          amount: swaps[0].amount,
          userData: swaps[0].userData,
        };

        /*
        See docs in iVault:
        If the swap is 'given in' (the number of tokens to send to the Pool is known), it returns the amount of tokens
        taken from the Pool, which must be greater than or equal to `limit`.
        If the swap is 'given out' (the number of tokens to take from the Pool is known), it returns the amount of tokens
        sent to the Pool, which must be less than or equal to `limit`.
        */
        const limit =
          swapKind === SwapType.SwapExactIn
            ? tokenOut.amount.toString()
            : tokenIn.amount.toString();

        return vaultService.swap(single, funds, limit, overrides);
      }

      const limits: string[] = this.calculateLimits(
        [tokenIn],
        [tokenOut],
        tokenAddresses
      );

      return vaultService.batchSwap(
        swapKind,
        swaps,
        tokenAddresses,
        funds,
        limits,
        overrides
      );
    } catch (e) {
      console.log('[Swapper] batchSwapV2 Error:', e);
      return Promise.reject(e);
    }
  }

  public async lidoBatchSwap(
    tokenIn: SwapToken,
    tokenOut: SwapToken,
    swaps: SwapV2[],
    tokenAddresses: string[]
  ): Promise<TransactionResponse> {
    console.log('[Swapper] lidoBatchSwap');
    const overrides: any = {};

    if (isSameAddress(tokenIn.address, AddressZero)) {
      overrides.value = tokenIn.amount;
    }

    // Convert tokenIn/tokenOut so that it matches what's in tokenAddresses
    const { stETH, wstETH } = this.config.network.addresses;
    if (tokenIn.address.toLowerCase() === stETH.toLowerCase()) {
      tokenIn = {
        address: wstETH.toLowerCase(),
        amount: await getWstETHByStETH(tokenIn.amount),
        type: tokenIn.type,
      };
    } else if (tokenOut.address.toLowerCase() === stETH.toLowerCase()) {
      tokenOut = {
        address: wstETH.toLowerCase(),
        amount: await getWstETHByStETH(tokenOut.amount),
        type: tokenOut.type,
      };
    }

    const swapKind =
      tokenOut.type === SwapTokenType.min
        ? SwapType.SwapExactIn
        : SwapType.SwapExactOut;

    const funds = await this.getFundManagement();

    try {
      if (swaps.length == 1) {
        const single: SingleSwap = {
          poolId: swaps[0].poolId,
          kind: swapKind,
          assetIn: tokenAddresses[swaps[0].assetInIndex],
          assetOut: tokenAddresses[swaps[0].assetOutIndex],
          amount: swaps[0].amount,
          userData: swaps[0].userData,
        };

        return lidoRelayerService.swap(
          single,
          funds,
          tokenOut.amount.toString(),
          overrides
        );
      }

      const limits = this.calculateLimits(
        [tokenIn],
        [tokenOut],
        tokenAddresses
      );

      return lidoRelayerService.batchSwap(
        swapKind,
        swaps,
        tokenAddresses,
        funds,
        limits,
        overrides
      );
    } catch (e) {
      console.log('[Swapper] lidoBatchSwap Error:', e);
      return Promise.reject(e);
    }
  }

  /**
   * Join a Boosted Pool (StablePhantom) using a batch swap
   */
  public async boostedJoinBatchSwap(
    tokensIn: SwapToken[],
    tokenOut: SwapToken,
    swaps: SwapV2[],
    tokenAddresses: string[]
  ) {
    try {
      const overrides: any = {};
      const funds = await this.getFundManagement();

      const limits: string[] = this.calculateLimits(
        tokensIn,
        [tokenOut],
        tokenAddresses
      );

      return vaultService.batchSwap(
        SwapType.SwapExactIn,
        swaps,
        tokenAddresses,
        funds,
        limits,
        overrides
      );
    } catch (error) {
      console.log('[Swapper] batchSwapGivenInV2 Error:', error);
      throw error;
    }
  }

  /**
   * Exit a Boosted Pool (StablePhantom) using a batch swap
   */
  public async boostedExitBatchSwap(
    tokenIn: SwapToken,
    tokensOut: SwapToken[],
    swaps: BatchSwapStep[],
    tokenAddresses: string[],
    swapKind: SwapType
  ): Promise<TransactionResponse> {
    try {
      const overrides: any = {};
      const funds = await this.getFundManagement();

      const limits: string[] = this.calculateLimits(
        [tokenIn],
        tokensOut,
        tokenAddresses
      );

      console.log('limits', limits);

      return vaultService.batchSwap(
        swapKind,
        swaps,
        tokenAddresses,
        funds,
        limits,
        overrides
      );
    } catch (error) {
      console.log('[Swapper] batchSwapGivenInV2 Error:', error);
      throw error;
    }
  }

  private async getFundManagement(): Promise<FundManagement> {
    const userAddress = await this.web3.getUserAddress();
    const funds: FundManagement = {
      sender: userAddress,
      recipient: userAddress,
      fromInternalBalance: false,
      toInternalBalance: false,
    };
    return funds;
  }

  public calculateLimits(
    tokensIn: SwapToken[],
    tokensOut: SwapToken[],
    tokenAddresses: string[]
  ): string[] {
    const limits: string[] = [];

    tokenAddresses.forEach((token, i) => {
      const tokenIn = tokensIn.find(
        swapToken => token.toLowerCase() === swapToken.address.toLowerCase()
      );
      const tokenOut = tokensOut.find(
        swapToken => token.toLowerCase() === swapToken.address.toLowerCase()
      );
      if (tokenIn) {
        limits[i] = tokenIn.amount.toString();
      } else if (tokenOut) {
        limits[i] = tokenOut.amount.mul(-1).toString();
      } else {
        limits[i] = '0';
      }
    });

    console.log('Limits', limits);
    return limits;
  }
}

export const swapService = new SwapService();
