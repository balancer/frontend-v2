import { BatchSwapStep, SwapType, SwapV2 } from '@sobal/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { TransactionResponse } from '@ethersproject/providers';

import { SorReturn } from '@/lib/utils/balancer/helpers/sor/sorManager';
import {
  SwapService,
  SwapToken,
  SwapTokenType,
} from '@/services/swap/swap.service';
import { useApp } from './useApp';

export function useSwapper() {
  /**
   * COMPOSABLES
   */
  const { transactionDeadline } = useApp();

  /**
   * SERVICES
   */
  const swapService = new SwapService(transactionDeadline);

  /**
   * METHODS
   */
  async function swapIn(
    sorReturn: SorReturn,
    tokenInAmount: BigNumber,
    tokenOutAmountMin: BigNumber
  ): Promise<TransactionResponse> {
    const tokenInAddress = sorReturn.result.tokenIn;
    const tokenOutAddress = sorReturn.result.tokenOut;

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

    console.log('PERFORM SWAP');
    return swapService.batchSwapV2(
      tokenIn,
      tokenOut,
      sorReturn.result.swaps,
      sorReturn.result.tokenAddresses
    );
  }

  async function swapOut(
    sorReturn: SorReturn,
    tokenInAmountMax: BigNumber,
    tokenOutAmount: BigNumber
  ): Promise<TransactionResponse> {
    const tokenInAddress = sorReturn.result.tokenIn;
    const tokenOutAddress = sorReturn.result.tokenOut;

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
      sorReturn.result.swaps,
      sorReturn.result.tokenAddresses
    );
  }

  async function boostedJoinBatchSwap(
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

  async function boostedExitBatchSwap(
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

  return { swapIn, swapOut, boostedJoinBatchSwap, boostedExitBatchSwap };
}
