import { Web3Provider } from "@ethersproject/providers";
import BigNumber from "bignumber.js";
import { exchangeProxyService } from "../contracts/exchange-proxy.service";
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Swap } from '@balancer-labs/sor/dist/types';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';

type Amount = {
  amount: BigNumber;
}

type AmountMin = {
  amount: BigNumber;
}

type AmountMax = {
  amount: BigNumber;
}

export interface SwapToken {
  address: string;
  amount?: BigNumber;
  amountMin?: BigNumber;
  amountMax?: BigNumber;
}

export default class SwapService {
  network: string;

  constructor() {
    this.network = "homestead";
  }

  public setNetwork(network: string) {
    this.network = network;
  }

  public async batchSwapV1(tokenIn: SwapToken, tokenOut: SwapToken, swaps: Swap[][]) : Promise<TransactionResponse> {
    console.log('[Swap Service] batchSwapV1');

    const overrides: any = {};

    /* I have no idea what this is doing still... */
    if (tokenIn.address === NATIVE_ASSET_ADDRESS) {
      overrides.value = `0x${tokenIn.amount.toString(16)}`;
    }

    try {
      return exchangeProxyService.multihopBatchSwap(
        swaps,
        tokenIn,
        tokenOut
      )
    } catch (e) {
      console.log('[Swapper] batchSwapV1 Error:', e);
      return Promise.reject(e);
    }

  }


  public async batchSwapV2(tokenIn: SwapToken, tokenOut: SwapToken, swaps: SwapV2[], tokenAddresses: string[]) : Promise<TransctionResponse> {
    if (isStETH(tokenIn.address, tokenOut.address)) {
      return this.lidoBatchSwap(tokenIn, tokenOut, swaps, tokenAddresses);
    }
    console.log('[Swap Service] batchSwapV2');
    const overrides: any = {};


    if (tokenIn.address === AddressZero) {
      overrides.value = `0x${tokenIn.amount.toString(16)}`;
    }

    const limits: string[] = this.calculateLimits(tokenIn, tokenOut, tokenAddresses);


  



  }

  public calculateLimits(tokenIn: SwapToken, tokenOut: SwapToken, tokenAddresses: string[]) : string[] {
      // Limits:
    // +ve means max to send
    // -ve mean min to receive
    // For a multihop the intermediate tokens should be 0
    const limits: string[] = [];

    if (tokenOut.amountMin) { // BatchSwapGivenIn
      tokenAddresses.forEach((token, i) => {
        if (token.toLowerCase() === tokenIn.address.toLowerCase()) {
          limits[i] = tokenIn.amount.toString();
        } else if (token.toLowerCase() === tokenOut.address.toLowerCase()) {
          limits[i] = tokenOut.amountMin.times(-1).toString();
        } else {
          limits[i] = '0';
        }
      });
    } else { // BatchSwapGivenOut
      tokenAddresses.forEach((token, i) => {
        if (token.toLowerCase() === tokenIn.address.toLowerCase()) {
          limits[i] = tokenIn.amountMax.toString();
        } else if (token.toLowerCase() === tokenOut.address.toLowerCase()) {
          limits[i] = tokenOut.amount.times(-1).toString();
        } else {
          limits[i] = '0';
        }
      });
    }

    console.log('Limits', limits);
    return limits;
  }

  public async lidoBatchSwap(tokenIn: SwapToken, tokenOut: SwapToken, swaps: SwapV2[], tokenAddresses: string[]) : Promise<TransctionResponse> {

  }

}

export const swapService = new SwapService();