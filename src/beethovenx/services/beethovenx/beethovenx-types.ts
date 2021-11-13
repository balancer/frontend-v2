export interface UserPortfolioData {
  timestamp: number;
  totalValue: number;
  totalSwapFees: number;
  totalSwapVolume: number;
  myFees: number;

  pools: UserPoolData[];
  tokens: UserTokenData[];
}

export interface UserPoolData {
  id: string;
  poolId: string;
  poolAddress: string;
  name: string;
  shares: number;
  percentShare: number;
  totalValue: number;
  pricePerShare: number;
  tokens: UserTokenData[];
  swapFees: number;
  swapVolume: number;
  myFees: number;
  percentOfPortfolio: number;
  priceChange: number;
  priceChangePercent: number;
}

export interface UserTokenData {
  id: string;
  address: string;
  symbol: string;
  name: string;
  balance: number;
  pricePerToken: number;
  totalValue: number;
  percentOfPortfolio: number;
}

export interface UserPortfolio {
  portfolio: UserPortfolioData;
  history: UserPortfolioData[];
}

interface Scalars {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Binary: any;
  Date: any;
  Datetime: any;
  GqlBigNumber: string;
  JSON: any;
  UUID: string;
}

export interface GqlUserPoolData {
  __typename?: 'GqlUserPoolData';
  id: Scalars['String'];
  myFees: Scalars['GqlBigNumber'];
  name: Scalars['String'];
  percentOfPortfolio: Scalars['Float'];
  percentShare: Scalars['Float'];
  poolAddress: Scalars['String'];
  poolId: Scalars['String'];
  priceChange: Scalars['GqlBigNumber'];
  priceChangePercent: Scalars['Float'];
  pricePerShare: Scalars['GqlBigNumber'];
  shares: Scalars['GqlBigNumber'];
  swapFees: Scalars['GqlBigNumber'];
  swapVolume: Scalars['GqlBigNumber'];
  tokens: Array<GqlUserTokenData>;
  totalValue: Scalars['GqlBigNumber'];
}

export interface GqlUserPortfolioData {
  __typename?: 'GqlUserPortfolioData';
  myFees: Scalars['GqlBigNumber'];
  pools: Array<GqlUserPoolData>;
  timestamp: Scalars['Int'];
  tokens: Array<GqlUserTokenData>;
  totalSwapFees: Scalars['GqlBigNumber'];
  totalSwapVolume: Scalars['GqlBigNumber'];
  totalValue: Scalars['GqlBigNumber'];
}

export interface GqlUserTokenData {
  __typename?: 'GqlUserTokenData';
  address: Scalars['String'];
  balance: Scalars['GqlBigNumber'];
  id: Scalars['String'];
  name: Scalars['String'];
  percentOfPortfolio: Scalars['Float'];
  pricePerToken: Scalars['GqlBigNumber'];
  symbol: Scalars['String'];
  totalValue: Scalars['GqlBigNumber'];
}

export interface GqlHistoricalTokenPrice {
  __typename?: 'GqlHistoricalTokenPrice';
  address: Scalars['String'];
  prices: Array<GqlHistoricalTokenPriceEntry>;
}

export interface GqlHistoricalTokenPriceEntry {
  __typename?: 'GqlHistoricalTokenPriceEntry';
  price: Scalars['Float'];
  timestamp: Scalars['String'];
}

export interface GqlTokenPrice {
  __typename?: 'GqlTokenPrice';
  address: Scalars['String'];
  price: Scalars['Float'];
}
