export type RuleFunction = (val: string | number) => string;
export type Rules = Array<RuleFunction>;
import { BigNumberish } from '@ethersproject/bignumber';

export interface FormRef {
  validate(): boolean;
}

export interface Token {
  address: string;
  balance: number;
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

export interface Claim {
  id: string;
  amount: string;
  amountDenorm: BigNumberish;
}
