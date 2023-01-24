import { OrderBalance, OrderKind } from '@cowprotocol/contracts';

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
  appData: string;
  feeAmount: string;
  kind: OrderKind;
  partiallyFillable: false;
  signature: string;
  status: 'pending' | 'fulfilled' | 'expired' | 'cancelled';
};

export type PriceQuoteParams = Pick<
  OrderMetaData,
  'sellToken' | 'buyToken' | 'kind'
> & {
  fromDecimals: number;
  toDecimals: number;
  from: string;
  receiver: string;
  sellAmountBeforeFee?: string | null;
  buyAmountAfterFee?: string | null;
  partiallyFillable?: boolean;
  sellTokenBalance?: OrderBalance;
};

export type CowSwapQuoteResponse = {
  quote: {
    sellToken: string;
    buyToken: string;
    receiver: string;
    sellAmount: string | null;
    buyAmount: string | null;
    validTo: string;
    appData: string;
    feeAmount: string | null;
    kind: string;
  };
  from: string;
  expiration: string;
  id: number;
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
