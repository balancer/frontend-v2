import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { SorReturn } from '@/lib/utils/balancer/helpers/sor/sorManager';
import {
  swapService,
  SwapToken,
  SwapTokenType
} from '@/services/swap/swap.service';
import { BatchSwapStep, SwapV2 } from '@balancer-labs/sdk';
import { SwapKind } from '@balancer-labs/balancer-js';

export async function swapIn(
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
        type: SwapTokenType.fixed
      };
    }
  );
  const tokenOut: SwapToken = {
    address: tokenOutAddress,
    amount: amountOutMin,
    type: SwapTokenType.min
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
  swapKind: SwapKind = SwapKind.GivenIn
): Promise<TransactionResponse> {
  const tokenIn: SwapToken = {
    address: tokenInAddress,
    amount: BigNumber.from(amountIn),
    type: SwapTokenType.min
  };

  const tokensOut: SwapToken[] = Object.entries(amountsOutMap).map(
    ([address, amount]) => {
      return {
        address,
        amount: BigNumber.from(amount),
        type: SwapTokenType.fixed
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
