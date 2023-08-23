import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { SubgraphPoolBase } from '@balancer-labs/sor';
import {
  BatchSwapStep,
  ExitPoolRequest,
  FundManagement,
  JoinPoolRequest,
  SwapType,
} from '@balancer-labs/sdk';

export type OutputReference = {
  index: number;
  key: BigNumber;
};

export interface EncodeBatchSwapInput {
  swapType: SwapType;
  swaps: BatchSwapStep[];
  assets: string[];
  funds: FundManagement;
  limits: string[];
  deadline: BigNumberish;
  value: BigNumberish;
  outputReferences: OutputReference[];
}

export interface EncodeExitPoolInput {
  poolId: string;
  poolKind: number;
  sender: string;
  recipient: string;
  outputReferences: OutputReference[];
  exitPoolRequest: ExitPoolRequest;
}

export interface EncodeJoinPoolInput {
  poolId: string;
  poolKind: number;
  sender: string;
  recipient: string;
  joinPoolRequest: JoinPoolRequest;
  value: BigNumberish;
  outputReference: BigNumber;
}

export interface EncodeUnwrapAaveStaticTokenInput {
  staticToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  toUnderlying: boolean;
  outputReference: BigNumberish;
}

export interface EncodeUnwrapYearnVaultTokenInput {
  vaultToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  outputReference: BigNumberish;
}

export interface EncodeWrapReaperVaultTokenInput {
  vaultToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  outputReference: BigNumberish;
}

export interface EncodeUnwrapReaperVaultTokenInput {
  vaultToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  outputReference: BigNumberish;
}

export interface EncodeWrapErc4626Input {
  wrappedToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  outputReference: BigNumberish;
}

export interface EncodeUnwrapErc4626Input {
  wrappedToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  outputReference: BigNumberish;
}

export interface ExitStablePhantomInput {
  account: string;
  poolId: string;
  exits: {
    bptAmountIn: string;
    tokenOut: string;
    unwrap?: boolean;
  }[];
  slippage: string;
}

export interface ExitAndBatchSwapExitItemInput {
  exitToken: string;
  exitExpectedAmountOut: string;
  batchSwapTokenOut?: string;
}

export type ExitPoolData = ExitPoolRequest &
  Omit<EncodeExitPoolInput, 'exitPoolRequest'>;

export interface NestedLinearPool {
  pool: SubgraphPoolBase;
  mainToken: string;
  poolTokenAddress: string;
  wrappedToken: string;
}

export interface EncodeReaperWrapInput {
  vaultToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  outputReference: BigNumberish;
}

export interface EncodeReaperUnwrapInput {
  vaultToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  outputReference: BigNumberish;
}

export interface EncodeGaugeDepositInput {
  gauge: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
}

export interface EncodeGaugeWithdrawInput {
  gauge: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
}
