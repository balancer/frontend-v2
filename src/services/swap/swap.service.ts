import { BigNumber } from '@ethersproject/bignumber';
import { exchangeProxyService } from '../contracts/exchange-proxy.service';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Swap } from '@balancer-labs/sor/dist/types';
import { AddressZero } from '@ethersproject/constants';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { getWstETHByStETH, isStETH } from '@/lib/utils/balancer/lido';
import { SwapV2 } from '@balancer-labs/sor2';
import ConfigService, { configService } from '@/services/config/config.service';
import { vaultService } from '@/services/contracts/vault.service';
import { lidoRelayerService } from '@/services/contracts/lido-relayer.service';
import {
  FundManagement,
  SingleSwap,
  SwapKind
} from '@balancer-labs/balancer-js';
import Web3Service, { web3Service } from '../web3/web3.service';

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

    /* I have no idea what this is doing still... */
    if (tokenIn.address === NATIVE_ASSET_ADDRESS) {
      options.value = `0x${tokenIn.amount.toHexString()}`;
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
      overrides.value = `0x${tokenIn.amount.toHexString()}`;
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

        return vaultService.swap(single, funds, tokenOut.amount.toString());
      }

      const limits: string[] = this.calculateLimits(
        tokenIn,
        tokenOut,
        tokenAddresses
      );

      return vaultService.batchSwap(
        swapKind,
        swaps,
        tokenAddresses,
        funds,
        limits
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
      overrides.value = `0x${tokenIn.amount.toHexString()}`;
    }

    // Convert tokenIn/tokenOut so that it matches what's in tokenAddresses
    const { stETH, wstETH } = this.config.network.addresses;
    if (tokenIn.address === stETH.toLowerCase()) {
      tokenIn = {
        address: wstETH.toLowerCase(),
        amount: await getWstETHByStETH(tokenIn.amount),
        type: tokenIn.type
      };
    } else if (tokenOut.address === stETH.toLowerCase()) {
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

      const limits = this.calculateLimits(tokenIn, tokenOut, tokenAddresses);

      return lidoRelayerService.batchSwap(
        swapKind,
        swaps,
        tokenAddresses,
        funds,
        limits
      );
    } catch (e) {
      console.log('[Swapper] lidoBatchSwap Error:', e);
      return Promise.reject(e);
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
    tokenIn: SwapToken,
    tokenOut: SwapToken,
    tokenAddresses: string[]
  ): string[] {
    const swapKind =
      tokenOut.type === SwapTokenType.min
        ? SwapKind.GivenIn
        : SwapKind.GivenOut;

    const limits: string[] = [];

    if (swapKind == SwapKind.GivenIn) {
      // BatchSwapGivenIn
      tokenAddresses.forEach((token, i) => {
        if (token.toLowerCase() === tokenIn.address.toLowerCase()) {
          limits[i] = tokenIn.amount.toString();
        } else if (token.toLowerCase() === tokenOut.address.toLowerCase()) {
          limits[i] = tokenOut.amount.mul(-1).toString();
        } else {
          limits[i] = '0';
        }
      });
    } else {
      // BatchSwapGivenOut
      tokenAddresses.forEach((token, i) => {
        if (token.toLowerCase() === tokenIn.address.toLowerCase()) {
          limits[i] = tokenIn.amount.toString();
        } else if (token.toLowerCase() === tokenOut.address.toLowerCase()) {
          limits[i] = tokenOut.amount.mul(-1).toString();
        } else {
          limits[i] = '0';
        }
      });
    }

    console.log('Limits', limits);
    return limits;
  }
}

export const swapService = new SwapService();
