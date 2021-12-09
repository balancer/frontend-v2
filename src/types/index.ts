export type RuleFunction = (val: string | number) => string;
export type Rules = Array<RuleFunction>;
import { BatchSwapStep } from '@balancer-labs/sdk';
import { SwapV2 } from '@balancer-labs/sor2';
import { BigNumberish } from '@ethersproject/bignumber';

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

export interface HtmlInputEvent {
  target: HTMLInputElement;
  key: string;
  preventDefault();
}

export interface MetamaskError extends Error {
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
  Completed
}

export type Step = {
  tooltip: string;
  state: StepState;
};

export type Address = string;
export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs
) => Record<string, any>;
