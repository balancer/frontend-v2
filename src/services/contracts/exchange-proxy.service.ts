import { ContractInterface } from '@ethersproject/contracts';
import exchangeProxyAbi from '@/lib/abi/ExchangeProxy.json';
import ConfigService, { configService } from '@/services/config/config.service';
import { Address, SwapToken, SwapTokenType } from '../swap/swap.service';
import { Swap } from '@balancer-labs/sor/dist/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import Web3Service, { web3Service } from '../web3/web3.service';

export default class ExchangeProxyService {
  abi: ContractInterface;

  constructor(
    private readonly config: ConfigService = configService,
    private readonly web3: Web3Service = web3Service
  ) {
    this.abi = exchangeProxyAbi;
  }

  private get address() {
    return this.config.network.addresses.exchangeProxy;
  }

  public multihopBatchSwap(
    swaps: Swap[][],
    tokenIn: SwapToken,
    tokenOut: SwapToken,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    if (tokenOut.type === SwapTokenType.min) {
      return this.multihopBatchSwapExactIn(
        swaps,
        tokenIn.address,
        tokenOut.address,
        tokenIn.amount.toString(),
        tokenOut.amount.toString(),
        options
      );
    }

    if (tokenIn.type === SwapTokenType.max) {
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

  public multihopBatchSwapExactIn(
    swaps: Swap[][],
    tokenIn: Address,
    tokenOut: Address,
    totalAmountIn: string,
    minTotalAmountOut: string,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return this.web3.sendTransaction(
      this.address,
      this.abi,
      'multihopBatchSwapExactIn',
      [swaps, tokenIn, tokenOut, totalAmountIn, minTotalAmountOut],
      options
    );
  }

  public multihopBatchSwapExactOut(
    swaps: Swap[][],
    tokenIn: Address,
    tokenOut: Address,
    maxTotalAmountIn: string,
    options: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return this.web3.sendTransaction(
      this.address,
      this.abi,
      'multihopBatchSwapExactOut',
      [swaps, tokenIn, tokenOut, maxTotalAmountIn],
      options
    );
  }
}

export const exchangeProxyService = new ExchangeProxyService();
