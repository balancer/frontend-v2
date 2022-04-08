import { WeightedPoolEncoder } from '@balancer-labs/sdk';
import { BigNumberish } from '@ethersproject/bignumber';

export type JoinWeightedPoolInit = {
  kind: 'Init';
  amountsIn: BigNumberish[];
};

export type JoinWeightedPoolExactTokensInForBPTOut = {
  kind: 'ExactTokensInForBPTOut';
  amountsIn: BigNumberish[];
  minimumBPT: BigNumberish;
};

export type JoinWeightedPoolTokenInForExactBPTOut = {
  kind: 'TokenInForExactBPTOut';
  bptAmountOut: BigNumberish;
  enterTokenIndex: number;
};

export type JoinWeightedPoolAllTokensInForExactBPTOut = {
  kind: 'AllTokensInForExactBPTOut';
  bptAmountOut: BigNumberish;
};

export type JoinData =
  | JoinWeightedPoolInit
  | JoinWeightedPoolExactTokensInForBPTOut
  | JoinWeightedPoolTokenInForExactBPTOut
  | JoinWeightedPoolAllTokensInForExactBPTOut;

export type ExitData =
  | ExitWeightedPoolExactBPTInForOneTokenOut
  | ExitWeightedPoolExactBPTInForTokensOut
  | ExitWeightedPoolBPTInForExactTokensOut;

export function encodeJoinWeightedPool(joinData: JoinData): string {
  if (joinData.kind == 'Init') {
    return WeightedPoolEncoder.joinInit(joinData.amountsIn);
  } else if (joinData.kind == 'ExactTokensInForBPTOut') {
    return WeightedPoolEncoder.joinExactTokensInForBPTOut(
      joinData.amountsIn,
      joinData.minimumBPT
    );
  } else if (joinData.kind == 'AllTokensInForExactBPTOut') {
    return WeightedPoolEncoder.joinAllTokensInForExactBPTOut(
      joinData.bptAmountOut
    );
  } else {
    return WeightedPoolEncoder.joinTokenInForExactBPTOut(
      joinData.bptAmountOut,
      joinData.enterTokenIndex
    );
  }
}

export type ExitWeightedPoolExactBPTInForOneTokenOut = {
  kind: 'ExactBPTInForOneTokenOut';
  bptAmountIn: BigNumberish;
  exitTokenIndex: number;
};

export type ExitWeightedPoolExactBPTInForTokensOut = {
  kind: 'ExactBPTInForTokensOut';
  bptAmountIn: BigNumberish;
};

export type ExitWeightedPoolBPTInForExactTokensOut = {
  kind: 'BPTInForExactTokensOut';
  amountsOut: BigNumberish[];
  maxBPTAmountIn: BigNumberish;
};

export function encodeExitWeightedPool(exitData: ExitData): string {
  if (exitData.kind == 'ExactBPTInForOneTokenOut') {
    return WeightedPoolEncoder.exitExactBPTInForOneTokenOut(
      exitData.bptAmountIn,
      exitData.exitTokenIndex
    );
  } else if (exitData.kind == 'ExactBPTInForTokensOut') {
    return WeightedPoolEncoder.exitExactBPTInForTokensOut(exitData.bptAmountIn);
  } else {
    return WeightedPoolEncoder.exitBPTInForExactTokensOut(
      exitData.amountsOut,
      exitData.maxBPTAmountIn
    );
  }
}
