import { BatchSwapStep, SwapV2 } from '@balancer-labs/sdk';
import { BigNumberish } from '@ethersproject/bignumber';

export type RuleFunction = (val: string | number) => string | boolean;
export type Rules = Array<RuleFunction>;
export interface FormRef {
  validate(): boolean;
}

export interface Token {
  address: string;
  balance: string;
  balanceDenorm: BigNumberish;
  chainId: number;
  decimals: number;
  logoURI: string;
  name: string;
  price: number;
  price24HChange: number;
  symbol: string;
  value: number;
  value24HChange: number;
}

export type TokenMap = Record<string, Token>;

export interface Claim {
  id: string;
  amount: string;
}

export interface WalletError extends Error {
  code: number | string;
}

export type BatchSwap = {
  amountTokenOut: string;
  swaps: SwapV2[];
  assets: string[];
};

export type BatchSwapOut = {
  returnAmounts: string[];
  swaps: BatchSwapStep[];
  assets: string[];
};

export enum StepState {
  Todo,
  Active,
  WalletOpen,
  Pending,
  Success,
  Warning,
  Error,
  Completed,
}

export type Step = {
  tooltip: string;
  state: StepState;
};

export type Address = string;

export type BaseContent = {
  title: string;
  description: string;
};
