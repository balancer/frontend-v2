import { TokenInput } from '@/providers/local/swaps.provider';
import { TokenInfoMap } from '@/types/TokenList';
import { BalancerSDK, SwapType } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { JsonRpcSigner } from '@ethersproject/providers';

export type SwapParams = {
  swapType: SwapType;
  signer: JsonRpcSigner;
  slippageBsp: number;
  tokenIn: TokenInput;
  tokenOut: TokenInput;
  tokenData: TokenInfoMap;
};

export type QueryOutput = {
  returnAmount: string;
  priceImpact: number;
};

export abstract class SwapHandler {
  constructor(public readonly sdk: BalancerSDK) {}

  abstract swap(params: SwapParams): Promise<TransactionResponse>;

  abstract querySwap(params: SwapParams): Promise<QueryOutput>;
}
