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
  kind: string;
  partiallyFillable: false;
  signature: string;
};

export type FeeQuoteParams = Pick<
  OrderMetaData,
  'sellToken' | 'buyToken' | 'kind'
> & {
  amount: string;
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

export type QuoteInformationObject = FeeQuoteParams & {
  fee: FeeInformation;
  price: PriceInformation;
  lastCheck: number;
  feeExceedsPrice: boolean;
};
