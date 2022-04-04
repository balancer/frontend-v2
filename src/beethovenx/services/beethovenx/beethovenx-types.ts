import { PoolToken, PoolType } from '@/services/balancer/subgraph/types';

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
  BigDecimal: string;
  BigInt: string;
  Bytes: string;
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

export interface GqlLgeCreateInput {
  id: Scalars['ID'];
  address: Scalars['String'];
  bannerImageUrl: Scalars['String'];
  collateralAmount: Scalars['String'];
  collateralEndWeight: Scalars['Int'];
  collateralStartWeight: Scalars['Int'];
  collateralTokenAddress: Scalars['String'];
  description: Scalars['String'];
  discordUrl: Scalars['String'];
  endDate: Scalars['String'];
  mediumUrl: Scalars['String'];
  name: Scalars['String'];
  startDate: Scalars['String'];
  swapFeePercentage: Scalars['String'];
  telegramUrl: Scalars['String'];
  tokenAmount: Scalars['String'];
  tokenContractAddress: Scalars['String'];
  tokenEndWeight: Scalars['Int'];
  tokenIconUrl: Scalars['String'];
  tokenStartWeight: Scalars['Int'];
  twitterUrl: Scalars['String'];
  websiteUrl: Scalars['String'];
}

export interface GqlLge {
  __typename?: 'GqlLge';
  address: Scalars['String'];
  bannerImageUrl: Scalars['String'];
  collateralAmount: Scalars['String'];
  collateralEndWeight: Scalars['Int'];
  collateralStartWeight: Scalars['Int'];
  collateralTokenAddress: Scalars['String'];
  description: Scalars['String'];
  discordUrl: Scalars['String'];
  endDate: Scalars['String'];
  id: Scalars['ID'];
  mediumUrl: Scalars['String'];
  name: Scalars['String'];
  startDate: Scalars['String'];
  swapFeePercentage: Scalars['String'];
  telegramUrl: Scalars['String'];
  tokenAmount: Scalars['String'];
  tokenContractAddress: Scalars['String'];
  tokenEndWeight: Scalars['Int'];
  tokenIconUrl: Scalars['String'];
  tokenStartWeight: Scalars['Int'];
  twitterUrl: Scalars['String'];
  websiteUrl: Scalars['String'];
  adminAddress: Scalars['String'];
  adminIsMultisig: Scalars['Boolean'];
}

export const CreateLgeTypes = {
  CreateLge: [
    { name: 'id', type: 'string' },
    { name: 'address', type: 'string' },
    { name: 'name', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'tokenContractAddress', type: 'string' },
    { name: 'collateralTokenAddress', type: 'string' },
    { name: 'tokenAmount', type: 'string' },
    { name: 'collateralAmount', type: 'string' },
    { name: 'tokenStartWeight', type: 'int' },
    { name: 'tokenEndWeight', type: 'int' },
    { name: 'collateralStartWeight', type: 'int' },
    { name: 'collateralEndWeight', type: 'int' },
    { name: 'swapFeePercentage', type: 'string' },
    { name: 'tokenIconUrl', type: 'string' },
    { name: 'bannerImageUrl', type: 'string' },
    { name: 'websiteUrl', type: 'string' },
    { name: 'telegramUrl', type: 'string' },
    { name: 'twitterUrl', type: 'string' },
    { name: 'discordUrl', type: 'string' },
    { name: 'mediumUrl', type: 'string' },
    { name: 'startDate', type: 'string' },
    { name: 'endDate', type: 'string' }
  ]
};

export interface GqlBeetsProtocolData {
  __typename?: 'GqlBeetsProtocolData';
  beetsPrice: Scalars['BigDecimal'];
  circulatingSupply: Scalars['BigDecimal'];
  marketCap: Scalars['BigDecimal'];
  poolCount: Scalars['BigInt'];
  totalLiquidity: Scalars['BigDecimal'];
  totalSwapFee: Scalars['BigDecimal'];
  totalSwapVolume: Scalars['BigDecimal'];
  swapFee24h: Scalars['BigDecimal'];
  swapVolume24h: Scalars['BigDecimal'];
}

export interface GqlBalancerPoolSnapshot {
  __typename?: 'GqlBalancerPoolSnapshot';
  id: Scalars['ID'];
  liquidityChange24h: Scalars['BigDecimal'];
  poolId: Scalars['ID'];
  swapFees24h: Scalars['BigDecimal'];
  swapVolume24h: Scalars['BigDecimal'];
  timestamp: Scalars['Int'];
  tokens: Array<GqlBalancerPoolToken>;
  totalLiquidity: Scalars['BigDecimal'];
  totalShares: Scalars['BigDecimal'];
  totalSwapFee: Scalars['BigDecimal'];
  totalSwapVolume: Scalars['BigDecimal'];
}

export interface GqlBalancerPoolToken {
  __typename?: 'GqlBalancerPoolToken';
  address: Scalars['String'];
  balance: Scalars['BigDecimal'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  isBpt?: Scalars['Boolean'];
  isPhantomBpt?: Scalars['Boolean'];
  name: Scalars['String'];
  priceRate: Scalars['BigDecimal'];
  symbol: Scalars['String'];
  weight?: Scalars['BigDecimal'];
}

export interface GqlBeetsFarm {
  __typename?: 'GqlBeetsFarm';
  allocPoint: Scalars['Int'];
  block: Scalars['BigInt'];
  id: Scalars['ID'];
  lastRewardBlock: Scalars['BigInt'];
  masterChef: GqlBeetsMasterChef;
  pair: Scalars['Bytes'];
  rewarder?: GqlBeetsRewarder;
  slpBalance: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  userCount: Scalars['BigInt'];
  rewardTokens: Array<GqlBeetsFarmRewardToken>;
}

export interface GqlBeetsFarmRewardToken {
  __typename?: 'GqlBeetsFarmRewardToken';
  address: Scalars['String'];
  decimals: Scalars['Int'];
  isBeets?: Scalars['Boolean'];
  rewardPerDay: Scalars['BigDecimal'];
  rewardPerSecond: Scalars['BigDecimal'];
  symbol: Scalars['String'];
  tokenPrice: Scalars['BigDecimal'];
}

export interface GqlBeetsFarmUser {
  __typename?: 'GqlBeetsFarmUser';
  address: Scalars['Bytes'];
  amount: Scalars['BigInt'];
  beetsHarvested: Scalars['BigInt'];
  farmId: Scalars['ID'];
  id: Scalars['ID'];
  rewardDebt: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
}

export interface GqlBeetsMasterChef {
  __typename?: 'GqlBeetsMasterChef';
  beetsPerBlock: Scalars['BigInt'];
  id: Scalars['ID'];
  totalAllocPoint: Scalars['Int'];
}

export interface GqlBeetsRewarder {
  __typename?: 'GqlBeetsRewarder';
  id: Scalars['ID'];
  rewardPerSecond: Scalars['BigInt'];
  rewardToken: Scalars['Bytes'];
  tokens: Array<GqlBeetsRewarderToken>;
}

export interface GqlBeetsRewarderToken {
  __typename?: 'GqlBeetsRewarderToken';
  rewardPerSecond: Scalars['BigInt'];
  symbol: Scalars['String'];
  token: Scalars['Bytes'];
  tokenPrice: Scalars['Float'];
}

export interface GqlBeetsConfig {
  __typename?: 'GqlBeetsConfig';
  blacklistedPools: Array<Scalars['String']>;
  featuredPools: Array<Scalars['String']>;
  homeFeaturedPools: Array<GqlBeetsConfigFeaturedPool>;
  homeNewsItems: Array<GqlBeetsConfigNewsItem>;
  homeEducationItems: Array<GqlBeetsConfigNewsItem>;
  incentivizedPools: Array<Scalars['String']>;
  pausedPools: Array<Scalars['String']>;
  poolFilters: Array<GqlBeetsConfigPoolFilterItem>;
  blacklistedTokens: Array<Scalars['String']>;
  boostedPools: Array<Scalars['String']>;
}

export interface GqlBeetsConfigFeaturedPool {
  __typename?: 'GqlBeetsConfigFeaturedPool';
  description?: Scalars['String'];
  image: Scalars['String'];
  poolId: Scalars['String'];
}

export interface GqlBeetsConfigNewsItem {
  __typename?: 'GqlBeetsConfigNewsItem';
  description: Scalars['String'];
  image: Scalars['String'];
  title: Scalars['String'];
  url: Scalars['String'];
  publishDate: Scalars['String'];
}

export interface GqlBeetsConfigPoolFilterItem {
  __typename?: 'GqlBeetsConfigPoolFilterItem';
  id: Scalars['ID'];
  pools: Array<Scalars['String']>;
  title: Scalars['String'];
}

export interface GqlBalancePoolApr {
  __typename?: 'GqlBalancePoolApr';
  beetsApr: Scalars['BigDecimal'];
  hasRewardApr: Scalars['Boolean'];
  items: Array<GqlBalancePoolAprItem>;
  swapApr: Scalars['BigDecimal'];
  thirdPartyApr: Scalars['BigDecimal'];
  total: Scalars['BigDecimal'];
}

export interface GqlBalancePoolAprItem {
  __typename?: 'GqlBalancePoolAprItem';
  apr: Scalars['BigDecimal'];
  subItems?: Array<GqlBalancePoolAprSubItem>;
  title: Scalars['String'];
}

export interface GqlBalancePoolAprSubItem {
  __typename?: 'GqlBalancePoolAprSubItem';
  apr: Scalars['BigDecimal'];
  title: Scalars['String'];
}

export interface GqlBalancerPoolActivity {
  __typename?: 'GqlBalancerPoolActivity';
  amounts: Array<Scalars['BigDecimal']>;
  id: Scalars['ID'];
  poolId: Scalars['String'];
  sender: Scalars['Bytes'];
  timestamp: Scalars['Int'];
  tx: Scalars['Bytes'];
  type: GqlBalancerPoolActivityType;
  valueUSD: Scalars['BigDecimal'];
}

export type GqlBalancerPoolActivityType = 'Exit' | 'Join';

export interface GqlSorGetSwapsInput {
  swapAmount: Scalars['BigDecimal'];
  swapOptions: GqlSorSwapOptionsInput;
  swapType: GqlSorSwapType;
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
}

export interface GqlSorGetSwapsResponse {
  __typename?: 'GqlSorGetSwapsResponse';
  marketSp: Scalars['String'];
  returnAmount: Scalars['BigDecimal'];
  returnAmountConsideringFees: Scalars['BigDecimal'];
  returnAmountFromSwaps?: Scalars['BigDecimal'];
  routes: Array<GqlSorSwapRoute>;
  swapAmount: Scalars['BigDecimal'];
  swapAmountForSwaps?: Scalars['BigDecimal'];
  swaps: Array<GqlSorSwap>;
  tokenAddresses: Array<Scalars['String']>;
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
}

export interface GqlSorSwap {
  __typename?: 'GqlSorSwap';
  amount: Scalars['String'];
  assetInIndex: Scalars['Int'];
  assetOutIndex: Scalars['Int'];
  poolId: Scalars['String'];
  userData: Scalars['String'];
}

export interface GqlSorSwapOptionsInput {
  forceRefresh?: Scalars['Boolean'];
  maxPools?: Scalars['Int'];
  timestamp?: Scalars['Int'];
}

export interface GqlSorSwapRoute {
  __typename?: 'GqlSorSwapRoute';
  hops: Array<GqlSorSwapRouteHop>;
  share: Scalars['Float'];
  tokenIn: Scalars['String'];
  tokenInAmount: Scalars['BigDecimal'];
  tokenOut: Scalars['String'];
  tokenOutAmount: Scalars['BigDecimal'];
}

export interface GqlSorSwapRouteHop {
  __typename?: 'GqlSorSwapRouteHop';
  poolId: Scalars['String'];
  tokenIn: Scalars['String'];
  tokenInAmount: Scalars['BigDecimal'];
  tokenOut: Scalars['String'];
  tokenOutAmount: Scalars['BigDecimal'];
}

export type GqlSorSwapType = 'EXACT_IN' | 'EXACT_OUT';

export interface PoolListItem {
  id: string;
  name: string;
  address: string;
  poolType: PoolType;
  swapFee: string;
  owner: string;
  factory: string;
  amp?: string;
  tokens: PoolToken[];
  tokensList: string[];
  totalLiquidity: string;
  mainTokens?: string[];
  apr: GqlBalancePoolApr;
  isNewPool?: boolean;
  volume24h: string;
  fees24h: string;
}

export interface UserPoolListItem extends PoolListItem {
  userBalance: string;
  hasUnstakedBpt?: boolean;
}

export interface GqlBeetsUserPoolData {
  __typename?: 'GqlBeetsUserPoolData';
  averageApr: Scalars['BigDecimal'];
  averageFarmApr: Scalars['BigDecimal'];
  pools: Array<GqlBeetsUserPoolPoolData>;
  totalBalanceUSD: Scalars['BigDecimal'];
  totalFarmBalanceUSD: Scalars['BigDecimal'];
}

export interface GqlBeetsUserPoolPoolData {
  __typename?: 'GqlBeetsUserPoolPoolData';
  balance: Scalars['BigDecimal'];
  balanceScaled: Scalars['BigInt'];
  balanceUSD: Scalars['BigDecimal'];
  farmBalanceUSD: Scalars['BigDecimal'];
  mainTokens?: Array<GqlBeetsUserPoolTokenData>;
  poolId: Scalars['String'];
  tokens: Array<GqlBeetsUserPoolTokenData>;
  hasUnstakedBpt?: Scalars['Boolean'];
}

export interface GqlBeetsUserPoolTokenData {
  __typename?: 'GqlBeetsUserPoolTokenData';
  address: Scalars['String'];
  balance: Scalars['String'];
  balanceUSD: Scalars['BigDecimal'];
  farmBalanceUSD: Scalars['BigDecimal'];
  symbol: Scalars['String'];
}

export interface GqlBeetsUserPendingAllFarmRewards {
  __typename?: 'GqlBeetsUserPendingAllFarmRewards';
  farmIds: Array<Scalars['String']>;
  farms: Array<GqlBeetsUserPendingFarmRewards>;
  numFarms: Scalars['BigInt'];
  tokens: Array<GqlBeetsUserPendingRewardsToken>;
  totalBalanceUSD: Scalars['BigDecimal'];
}

export interface GqlBeetsUserPendingFarmRewards {
  __typename?: 'GqlBeetsUserPendingFarmRewards';
  balanceUSD: Scalars['BigDecimal'];
  farmId: Scalars['String'];
  tokens: Array<GqlBeetsUserPendingRewardsToken>;
}

export interface GqlBeetsUserPendingRewards {
  __typename?: 'GqlBeetsUserPendingRewards';
  farm: GqlBeetsUserPendingAllFarmRewards;
}

export interface GqlBeetsUserPendingRewardsToken {
  __typename?: 'GqlBeetsUserPendingRewardsToken';
  address: Scalars['Bytes'];
  balance: Scalars['BigDecimal'];
  balanceUSD: Scalars['BigDecimal'];
  symbol: Scalars['String'];
}

export interface GqlBalancerPoolComposition {
  __typename?: 'GqlBalancerPoolComposition';
  tokens: Array<GqlBalancerPoolCompositionToken>;
}

export interface GqlBalancerPoolCompositionToken {
  __typename?: 'GqlBalancerPoolCompositionToken';
  address: Scalars['String'];
  balance: Scalars['BigDecimal'];
  decimals: Scalars['Int'];
  nestedTokens?: Array<GqlBalancerPoolCompositionToken>;
  symbol: Scalars['String'];
  valueUSD: Scalars['BigDecimal'];
  weight?: Scalars['BigDecimal'];
}

export interface GqlBalancerPool {
  __typename?: 'GqlBalancerPool';
  address: Scalars['Bytes'];
  tokenAddresses: string[];
  amp?: Scalars['BigInt'];
  apr: GqlBalancePoolApr;
  baseToken?: Scalars['Bytes'];
  composition: GqlBalancerPoolComposition;
  createTime: Scalars['Int'];
  expiryTime?: Scalars['BigInt'];
  factory?: Scalars['Bytes'];
  farm?: GqlBeetsFarm;
  farmTotalLiquidity: Scalars['BigDecimal'];
  fees24h: Scalars['BigDecimal'];
  holdersCount: Scalars['BigInt'];
  id: Scalars['ID'];
  isNewPool?: Scalars['Boolean'];
  linearPools?: Array<GqlBalancerPoolLinearPoolData>;
  lowerTarget?: Scalars['String'];
  mainIndex?: Scalars['Int'];
  mainTokens?: Array<Scalars['String']>;
  name?: Scalars['String'];
  owner?: Scalars['Bytes'];
  poolType?: Scalars['String'];
  principalToken?: Scalars['Bytes'];
  stablePhantomPools?: Array<GqlBalancerPoolStablePhantomPoolData>;
  swapEnabled: Scalars['Boolean'];
  swapFee: Scalars['BigDecimal'];
  swapsCount: Scalars['BigInt'];
  symbol: Scalars['String'];
  tokenRates?: Array<Scalars['String']>;
  tokens: Array<GqlBalancerPoolToken>;
  tokensList: Array<Scalars['Bytes']>;
  totalLiquidity: Scalars['BigDecimal'];
  totalShares: Scalars['BigDecimal'];
  totalSwapFee: Scalars['BigDecimal'];
  totalSwapVolume: Scalars['BigDecimal'];
  totalWeight?: Scalars['BigDecimal'];
  unitSeconds?: Scalars['BigInt'];
  upperTarget?: Scalars['String'];
  volume24h: Scalars['BigDecimal'];
  wrappedIndex?: Scalars['Int'];
}

export interface GqlBalancerPoolWithRequiredFarm extends GqlBalancerPool {
  farm: GqlBeetsFarm;
}

export interface GqlBalancerPoolLinearPoolData {
  __typename?: 'GqlBalancerPoolLinearPoolData';
  address: Scalars['String'];
  balance: Scalars['String'];
  id: Scalars['ID'];
  mainToken: GqlBalancerPoolLinearPoolMainToken;
  mainTokenTotalBalance: Scalars['String'];
  poolToken: Scalars['String'];
  priceRate: Scalars['String'];
  symbol: Scalars['String'];
  totalSupply: Scalars['String'];
  unwrappedTokenAddress: Scalars['String'];
  wrappedToken: GqlBalancerPoolLinearPoolWrappedToken;
}

export interface GqlBalancerPoolLinearPoolMainToken {
  __typename?: 'GqlBalancerPoolLinearPoolMainToken';
  address: Scalars['String'];
  balance: Scalars['String'];
  decimals: Scalars['Int'];
  index: Scalars['Int'];
  name: Scalars['String'];
  symbol: Scalars['String'];
  totalSupply: Scalars['String'];
}

export interface GqlBalancerPoolLinearPoolWrappedToken {
  __typename?: 'GqlBalancerPoolLinearPoolWrappedToken';
  address: Scalars['String'];
  balance: Scalars['String'];
  decimals: Scalars['Int'];
  index: Scalars['Int'];
  name: Scalars['String'];
  priceRate: Scalars['String'];
  symbol: Scalars['String'];
  totalSupply: Scalars['String'];
}

export interface GqlBalancerPoolStablePhantomPoolData {
  __typename?: 'GqlBalancerPoolStablePhantomPoolData';
  address: Scalars['String'];
  balance: Scalars['String'];
  id: Scalars['ID'];
  symbol: Scalars['String'];
  tokens: Array<GqlBalancerPoolToken>;
  totalSupply: Scalars['String'];
}
