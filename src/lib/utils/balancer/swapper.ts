import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { BigNumber } from 'bignumber.js';
import { SorReturn } from '@/lib/utils/balancer/helpers/sor/sorManager';
import {
  swapService,
  SwapToken,
  SwapTokenType
} from '@/services/swap/swap.service';

export async function swapIn(
  network: string,
  provider: Web3Provider,
  sorReturn: SorReturn,
  tokenInAmount: BigNumber,
  tokenOutAmountMin: BigNumber
): Promise<TransactionResponse> {
  const tokenInAddress = sorReturn.isV1swap
    ? sorReturn.tokenIn
    : sorReturn.v2result.tokenIn;
  const tokenOutAddress = sorReturn.isV1swap
    ? sorReturn.tokenOut
    : sorReturn.v2result.tokenOut;

  const tokenIn: SwapToken = {
    address: tokenInAddress,
    amount: tokenInAmount,
    type: SwapTokenType.fixed
  };

  const tokenOut: SwapToken = {
    address: tokenOutAddress,
    amount: tokenOutAmountMin,
    type: SwapTokenType.min
  };

  if (sorReturn.isV1swap) {
    return swapService.batchSwapV1(tokenIn, tokenOut, sorReturn.v1result[0]);
  }

  return swapService.batchSwapV2(
    tokenIn,
    tokenOut,
    sorReturn.v2result.swaps,
    sorReturn.v2result.tokenAddresses
  );
}

export async function swapOut(
  network: string,
  provider: Web3Provider,
  sorReturn: SorReturn,
  tokenInAmountMax: BigNumber,
  tokenOutAmount: BigNumber
): Promise<TransactionResponse> {
  const tokenInAddress = sorReturn.isV1swap
    ? sorReturn.tokenIn
    : sorReturn.v2result.tokenIn;
  const tokenOutAddress = sorReturn.isV1swap
    ? sorReturn.tokenOut
    : sorReturn.v2result.tokenOut;

  const tokenIn: SwapToken = {
    address: tokenInAddress,
    amount: tokenInAmountMax,
    type: SwapTokenType.max
  };

  const tokenOut: SwapToken = {
    address: tokenOutAddress,
    amount: tokenOutAmount,
    type: SwapTokenType.fixed
  };

  if (sorReturn.isV1swap) {
    swapService.batchSwapV1(tokenIn, tokenOut, sorReturn.v1result[0]);
  }

  return swapService.batchSwapV2(
    tokenIn,
    tokenOut,
    sorReturn.v2result.swaps,
    sorReturn.v2result.tokenAddresses
  );
}
