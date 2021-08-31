import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumberish } from '@ethersproject/bignumber';

const JOIN_WEIGHTED_POOL_INIT_TAG = 0;
const JOIN_WEIGHTED_POOL_EXACT_TOKENS_IN_FOR_BPT_OUT_TAG = 1;
const JOIN_WEIGHTED_POOL_TOKEN_IN_FOR_EXACT_BPT_OUT_TAG = 2;

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

export type JoinData =
  | JoinWeightedPoolInit
  | JoinWeightedPoolExactTokensInForBPTOut
  | JoinWeightedPoolTokenInForExactBPTOut;

export type ExitData =
  | ExitWeightedPoolExactBPTInForOneTokenOut
  | ExitWeightedPoolExactBPTInForTokensOut
  | ExitWeightedPoolBPTInForExactTokensOut;

export function encodeJoinWeightedPool(joinData: JoinData): string {
  if (joinData.kind == 'Init') {
    return defaultAbiCoder.encode(
      ['uint256', 'uint256[]'],
      [JOIN_WEIGHTED_POOL_INIT_TAG, joinData.amountsIn]
    );
  } else if (joinData.kind == 'ExactTokensInForBPTOut') {
    return defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [
        JOIN_WEIGHTED_POOL_EXACT_TOKENS_IN_FOR_BPT_OUT_TAG,
        joinData.amountsIn,
        joinData.minimumBPT
      ]
    );
  } else {
    return defaultAbiCoder.encode(
      ['uint256', 'uint256', 'uint256'],
      [
        JOIN_WEIGHTED_POOL_TOKEN_IN_FOR_EXACT_BPT_OUT_TAG,
        joinData.bptAmountOut,
        joinData.enterTokenIndex
      ]
    );
  }
}

const EXIT_WEIGHTED_POOL_EXACT_BPT_IN_FOR_ONE_TOKEN_OUT_TAG = 0;
const EXIT_WEIGHTED_POOL_EXACT_BPT_IN_FOR_TOKENS_OUT_TAG = 1;
const EXIT_WEIGHTED_POOL_BPT_IN_FOR_EXACT_TOKENS_OUT_TAG = 2;

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
    return defaultAbiCoder.encode(
      ['uint256', 'uint256', 'uint256'],
      [
        EXIT_WEIGHTED_POOL_EXACT_BPT_IN_FOR_ONE_TOKEN_OUT_TAG,
        exitData.bptAmountIn,
        exitData.exitTokenIndex
      ]
    );
  } else if (exitData.kind == 'ExactBPTInForTokensOut') {
    return defaultAbiCoder.encode(
      ['uint256', 'uint256'],
      [EXIT_WEIGHTED_POOL_EXACT_BPT_IN_FOR_TOKENS_OUT_TAG, exitData.bptAmountIn]
    );
  } else {
    return defaultAbiCoder.encode(
      ['uint256', 'uint256[]', 'uint256'],
      [
        EXIT_WEIGHTED_POOL_BPT_IN_FOR_EXACT_TOKENS_OUT_TAG,
        exitData.amountsOut,
        exitData.maxBPTAmountIn
      ]
    );
  }
}
