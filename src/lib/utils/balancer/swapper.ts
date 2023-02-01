import { SwapInfo } from '@balancer/sdk';
import { BatchSwapStep, SwapType, SwapV2 } from '@balancer-labs/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';

import {
  swapService,
  SwapToken,
  SwapTokenType,
} from '@/services/swap/swap.service';

export async function swapIn(
  swapInfo: SwapInfo,
  tokenInAmount: BigNumber,
  tokenOutAmountMin: BigNumber
): Promise<TransactionResponse> {
  const tokenInAddress = swapInfo.swap.inputAmount.token.address;
  const tokenOutAddress = swapInfo.swap.outputAmount.token.address;

  const tokenIn: SwapToken = {
    address: tokenInAddress,
    amount: tokenInAmount,
    type: SwapTokenType.fixed,
  };

  const tokenOut: SwapToken = {
    address: tokenOutAddress,
    amount: tokenOutAmountMin,
    type: SwapTokenType.min,
  };

  return swapService.batchSwapV2(
    tokenIn,
    tokenOut,
    swapInfo.swap.swaps,
    swapInfo.swap.assets
  );
}

export async function swapOut(
  swapInfo: SwapInfo,
  tokenInAmountMax: BigNumber,
  tokenOutAmount: BigNumber
): Promise<TransactionResponse> {
  const tokenInAddress = swapInfo.swap.inputAmount.token.address;
  const tokenOutAddress = swapInfo.swap.outputAmount.token.address;

  const tokenIn: SwapToken = {
    address: tokenInAddress,
    amount: tokenInAmountMax,
    type: SwapTokenType.max,
  };

  const tokenOut: SwapToken = {
    address: tokenOutAddress,
    amount: tokenOutAmount,
    type: SwapTokenType.fixed,
  };

  return swapService.batchSwapV2(
    tokenIn,
    tokenOut,
    swapInfo.swap.swaps,
    swapInfo.swap.assets
  );
}

export async function boostedJoinBatchSwap(
  swaps: SwapV2[],
  tokenAddresses: string[],
  tokenOutAddress: string,
  amountsInMap: Record<string, BigNumber>,
  amountOutMin: BigNumber
) {
  const tokensIn: SwapToken[] = Object.entries(amountsInMap).map(
    ([address, amount]) => {
      return {
        address,
        amount,
        type: SwapTokenType.fixed,
      };
    }
  );
  const tokenOut: SwapToken = {
    address: tokenOutAddress,
    amount: amountOutMin,
    type: SwapTokenType.min,
  };
  return swapService.boostedJoinBatchSwap(
    tokensIn,
    tokenOut,
    swaps,
    tokenAddresses
  );
}

export async function boostedExitBatchSwap(
  swaps: BatchSwapStep[],
  tokenAddresses: string[],
  tokenInAddress: string,
  amountIn: string,
  amountsOutMap: Record<string, string>,
  swapKind: SwapType = SwapType.SwapExactIn
): Promise<TransactionResponse> {
  const tokenIn: SwapToken = {
    address: tokenInAddress,
    amount: BigNumber.from(amountIn),
    type: SwapTokenType.min,
  };

  const tokensOut: SwapToken[] = Object.entries(amountsOutMap).map(
    ([address, amount]) => {
      return {
        address,
        amount: BigNumber.from(amount),
        type: SwapTokenType.fixed,
      };
    }
  );
  return swapService.boostedExitBatchSwap(
    tokenIn,
    tokensOut,
    swaps,
    tokenAddresses,
    swapKind
  );
}
