import { OrderKind } from '@gnosis.pm/gp-v2-contracts';

export type OrderID = string;

export type OrderMetaData = {
  creationDate: string;
  owner: string;
  uid: OrderID;
  availableBalance: string;
  executedBuyAmount: string;
  executedSellAmount: string;
  executedSellAmountBeforeFees: string;
  executedFeeAmount: string;
  invalidated: false;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  buyAmount: string;
  validTo: number;
  appData: number;
  feeAmount: string;
  kind: OrderKind;
  partiallyFillable: false;
  signature: string;
  status: 'pending' | 'fulfilled' | 'expired' | 'cancelled';
};

export type FeeQuoteParams = Pick<
  OrderMetaData,
  'sellToken' | 'buyToken' | 'kind'
> & {
  amount: string;
  fromDecimals: number;
  toDecimals: number;
};

export type PriceQuoteParams = FeeQuoteParams;

export type FeeInformation = {
  expirationDate: string;
  amount: string;
};

export type PriceInformation = {
  token: string;
  amount: string | null;
};

export interface Market<T = string> {
  baseToken: T;
  quoteToken: T;
}

export interface CanonicalMarketParams<T> {
  sellToken: T;
  buyToken: T;
  kind: OrderKind;
}

export interface TokensFromMarketParams<T> extends Market<T> {
  kind: OrderKind;
}
