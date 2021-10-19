import exchangeProxyAbi from '@/lib/abi/ExchangeProxy.json';
import configs from '@/lib/config';
import { SwapToken } from '../swap/swap.service';
import { Swap } from '@balancer-labs/sor/dist/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { contractCaller } from './contract-caller.service';

export default class ExchangeProxyService {
  network: string;
  address: string;
  abi: any;
  signer: any;
  contract: any;
  contractWithSigner: any;

  constructor() {
    this.network = 'homestead';
    this.address = configs[this.network].addresses.exchangeProxy;
    this.abi = exchangeProxyAbi;
  }

  public async multihopBatchSwap(
    swaps: Swap[][],
    tokenIn: SwapToken,
    tokenOut: SwapToken,
    options: Record<string, any> = {}
  ) : Promise<TransactionResponse> {
    if (tokenOut.type == 'min') {
      return this.multihopBatchSwapExactIn(
        swaps,
        tokenIn.address,
        tokenOut.address,
        tokenIn.amount.toString(),
        tokenOut.amount.toString(),
        options
      );
    }

    if (tokenIn.type == 'max') {
      return this.multihopBatchSwapExactOut(
        swaps,
        tokenIn.address,
        tokenOut.address,
        tokenIn.amount.toString(),
        options
      );
    }

    return Promise.reject(
      new Error('Invalid swap, must specify minimum out, or maximum in.')
    );
  }

  public async multihopBatchSwapExactIn(
    swaps: Swap[][],
    tokenIn: string,
    tokenOut: string,
    totalAmountIn: string,
    minTotalAmountOut: string,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return contractCaller.sendTransaction(
      this.address,
      this.abi,
      'multihopBatchSwapExactIn',
      [swaps, tokenIn, tokenOut, totalAmountIn, minTotalAmountOut],
      options
    );
  }

  public async multihopBatchSwapExactOut(
    swaps: Swap[][],
    tokenIn: string,
    tokenOut: string,
    maxTotalAmountIn: string,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return contractCaller.sendTransaction(
      this.address,
      this.abi,
      'multihopBatchSwapExactOut',
      [swaps, tokenIn, tokenOut, maxTotalAmountIn],
      options
    );
  }
}

export const exchangeProxyService = new ExchangeProxyService();
