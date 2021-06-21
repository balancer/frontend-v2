export type RuleFunction = (val: string | number) => string;
export type Rules = Array<RuleFunction>;
import { TokenListItem } from '@/composables/useTokenLists';
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

export type TokenMap = Record<string, TokenListItem>;
export type OgTokenMap = Record<string, Token>;

export interface Claim {
  id: string;
  amount: string;
  amountDenorm: BigNumberish;
}
