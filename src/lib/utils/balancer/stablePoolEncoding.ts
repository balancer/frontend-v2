import { StablePoolEncoder } from '@balancer-labs/sdk';
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

export function encodeJoinStablePool(
  joinData:
    | JoinStablePoolInit
    | JoinStablePoolExactTokensInForBPTOut
    | JoinStablePoolTokenInForExactBPTOut
): string {
  if (joinData.kind == 'Init') {
    return StablePoolEncoder.joinInit(joinData.amountsIn);
  } else if (joinData.kind == 'ExactTokensInForBPTOut') {
    return StablePoolEncoder.joinExactTokensInForBPTOut(
      joinData.amountsIn,
      joinData.minimumBPT
    );
  } else {
    return StablePoolEncoder.joinTokenInForExactBPTOut(
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

export type ExitStablePoolExactBPTInForTokensOut = {
  kind: 'ExactBPTInForTokensOut';
  bptAmountIn: BigNumberish;
};

export type ExitStablePoolBPTInForExactTokensOut = {
  kind: 'BPTInForExactTokensOut';
  amountsOut: BigNumberish[];
  maxBPTAmountIn: BigNumberish;
};

export function encodeExitStablePool(
  exitData:
    | ExitStablePoolExactBPTInForOneTokenOut
    | ExitStablePoolExactBPTInForTokensOut
    | ExitStablePoolBPTInForExactTokensOut
): string {
  if (exitData.kind == 'ExactBPTInForOneTokenOut') {
    return StablePoolEncoder.exitExactBPTInForOneTokenOut(
      exitData.bptAmountIn,
      exitData.exitTokenIndex
    );
  } else if (exitData.kind == 'ExactBPTInForTokensOut') {
    return StablePoolEncoder.exitExactBPTInForTokensOut(exitData.bptAmountIn);
  } else {
    return StablePoolEncoder.exitBPTInForExactTokensOut(
      exitData.amountsOut,
      exitData.maxBPTAmountIn
    );
  }
}
