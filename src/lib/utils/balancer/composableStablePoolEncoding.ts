import { ComposableStablePoolEncoder } from '@balancer-labs/sdk';
import { BigNumberish } from '@ethersproject/bignumber';

export type JoinStablePoolInit = {
  kind: 'Init';
  amountsIn: BigNumberish[];
};

export type JoinStablePoolExactTokensInForBPTOut = {
  kind: 'ExactTokensInForBPTOut';
  amountsIn: BigNumberish[];
  minimumBPT: BigNumberish;
};

export type JoinStablePoolTokenInForExactBPTOut = {
  kind: 'TokenInForExactBPTOut';
  bptAmountOut: BigNumberish;
  enterTokenIndex: number;
};

export function encodeJoinComposableStablePool(
  joinData:
    | JoinStablePoolInit
    | JoinStablePoolExactTokensInForBPTOut
    | JoinStablePoolTokenInForExactBPTOut
): string {
  if (joinData.kind == 'Init') {
    return ComposableStablePoolEncoder.joinInit(joinData.amountsIn);
  } else if (joinData.kind == 'ExactTokensInForBPTOut') {
    return ComposableStablePoolEncoder.joinExactTokensInForBPTOut(
      joinData.amountsIn,
      joinData.minimumBPT
    );
  } else {
    return ComposableStablePoolEncoder.joinTokenInForExactBPTOut(
      joinData.bptAmountOut,
      joinData.enterTokenIndex
    );
  }
}

export type ExitStablePoolExactBPTInForOneTokenOut = {
  kind: 'ExactBPTInForOneTokenOut';
  bptAmountIn: BigNumberish;
  exitTokenIndex: number;
};

export type ExitStablePoolBPTInForExactTokensOut = {
  kind: 'BPTInForExactTokensOut';
  amountsOut: BigNumberish[];
  maxBPTAmountIn: BigNumberish;
};

export function encodeExitComposableStablePool(
  exitData:
    | ExitStablePoolExactBPTInForOneTokenOut
    | ExitStablePoolBPTInForExactTokensOut
): string {
  if (exitData.kind == 'ExactBPTInForOneTokenOut') {
    return ComposableStablePoolEncoder.exitExactBPTInForOneTokenOut(
      exitData.bptAmountIn,
      exitData.exitTokenIndex
    );
  }

  return ComposableStablePoolEncoder.exitBPTInForExactTokensOut(
    exitData.amountsOut,
    exitData.maxBPTAmountIn
  );
}
