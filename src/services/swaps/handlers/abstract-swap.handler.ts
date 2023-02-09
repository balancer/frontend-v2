import { BalancerSDK, SwapType } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';

export type SwapParams = {
  swapType: SwapType;
};

export type QueryOutput = {
  priceImpact: number;
};

export abstract class SwapHandler {
  constructor(public readonly sdk: BalancerSDK) {}

  abstract swap(params: SwapParams): Promise<TransactionResponse>;

  abstract querySwap(params: SwapParams): Promise<QueryOutput>;
}
