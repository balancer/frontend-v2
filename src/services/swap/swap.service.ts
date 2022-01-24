import { BigNumber } from '@ethersproject/bignumber';
import { exchangeProxyService } from '../contracts/exchange-proxy.service';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Swap } from '@balancer-labs/sor/dist/types';
import { AddressZero } from '@ethersproject/constants';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { getWstETHByStETH, isStETH } from '@/lib/utils/balancer/lido';
import ConfigService, { configService } from '@/services/config/config.service';
import { vaultService } from '@/services/contracts/vault.service';
import { lidoRelayerService } from '@/services/contracts/lido-relayer.service';
import {
  FundManagement,
  SingleSwap,
  SwapKind
} from '@balancer-labs/balancer-js';
import Web3Service, { web3Service } from '../web3/web3.service';
import { BatchSwapStep, SwapV2 } from '@balancer-labs/sdk';

export type Address = string;

export enum SwapTokenType {
  fixed,
  min,
  max
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

  public async batchSwapV1(
    tokenIn: SwapToken,
    tokenOut: SwapToken,
    swaps: Swap[][]
  ): Promise<TransactionResponse> {
    console.log('[Swap Service] batchSwapV1');

    const options: any = {};

    if (tokenIn.address === NATIVE_ASSET_ADDRESS) {
      options.value = tokenIn.amount;
    }

    try {
      return exchangeProxyService.multihopBatchSwap(
        swaps,
        tokenIn,
        tokenOut,
        options
      );
    } catch (e) {
      console.log('[Swapper] batchSwapV1 Error:', e);
      return Promise.reject(e);
    }
  }

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

    if (tokenIn.address === AddressZero) {
      overrides.value = tokenIn.amount;
    }

    const swapKind =
      tokenOut.type === SwapTokenType.min
        ? SwapKind.GivenIn
        : SwapKind.GivenOut;

    const funds = await this.getFundManagement();

    try {
      if (swaps.length == 1) {
        const single: SingleSwap = {
          poolId: swaps[0].poolId,
          kind: swapKind,
          assetIn: tokenAddresses[swaps[0].assetInIndex],
          assetOut: tokenAddresses[swaps[0].assetOutIndex],
          amount: swaps[0].amount,
          userData: swaps[0].userData
        };

        return vaultService.swap(
          single,
          funds,
          tokenOut.amount.toString(),
          overrides
        );
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

    if (tokenIn.address === AddressZero) {
      overrides.value = tokenIn.amount;
    }

    // Convert tokenIn/tokenOut so that it matches what's in tokenAddresses
    const { stETH, wstETH } = this.config.network.addresses;
    if (tokenIn.address.toLowerCase() === stETH.toLowerCase()) {
      tokenIn = {
        address: wstETH.toLowerCase(),
        amount: await getWstETHByStETH(tokenIn.amount),
        type: tokenIn.type
      };
    } else if (tokenOut.address.toLowerCase() === stETH.toLowerCase()) {
      tokenOut = {
        address: wstETH.toLowerCase(),
        amount: await getWstETHByStETH(tokenOut.amount),
        type: tokenOut.type
      };
    }

    const swapKind =
      tokenOut.type === SwapTokenType.min
        ? SwapKind.GivenIn
        : SwapKind.GivenOut;

    const funds = await this.getFundManagement();

    try {
      if (swaps.length == 1) {
        const single: SingleSwap = {
          poolId: swaps[0].poolId,
          kind: swapKind,
          assetIn: tokenAddresses[swaps[0].assetInIndex],
          assetOut: tokenAddresses[swaps[0].assetOutIndex],
          amount: swaps[0].amount,
          userData: swaps[0].userData
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
        SwapKind.GivenIn,
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
    swapKind: SwapKind
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
      toInternalBalance: false
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
