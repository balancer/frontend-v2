import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  AmountHumanReadable: any;
  BigDecimal: string;
  BigInt: string;
  Bytes: string;
  Date: any;
  GqlBigNumber: any;
  JSON: any;
};

export type GqlBalancePoolAprItem = {
  __typename?: 'GqlBalancePoolAprItem';
  apr: GqlPoolAprValue;
  id: Scalars['ID'];
  subItems?: Maybe<Array<GqlBalancePoolAprSubItem>>;
  title: Scalars['String'];
};

export type GqlBalancePoolAprSubItem = {
  __typename?: 'GqlBalancePoolAprSubItem';
  apr: GqlPoolAprValue;
  id: Scalars['ID'];
  title: Scalars['String'];
};

export enum GqlChain {
  Arbitrum = 'ARBITRUM',
  Avalanche = 'AVALANCHE',
  Fantom = 'FANTOM',
  Gnosis = 'GNOSIS',
  Mainnet = 'MAINNET',
  Optimism = 'OPTIMISM',
  Polygon = 'POLYGON',
  Zkevm = 'ZKEVM',
}

export type GqlContentNewsItem = {
  __typename?: 'GqlContentNewsItem';
  discussionUrl?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  image?: Maybe<Scalars['String']>;
  source: GqlContentNewsItemSource;
  text: Scalars['String'];
  timestamp: Scalars['String'];
  url: Scalars['String'];
};

export enum GqlContentNewsItemSource {
  Discord = 'discord',
  Medium = 'medium',
  Twitter = 'twitter',
}

export type GqlFeaturePoolGroupItemExternalLink = {
  __typename?: 'GqlFeaturePoolGroupItemExternalLink';
  buttonText: Scalars['String'];
  buttonUrl: Scalars['String'];
  id: Scalars['ID'];
  image: Scalars['String'];
};

export type GqlHistoricalTokenPrice = {
  __typename?: 'GqlHistoricalTokenPrice';
  address: Scalars['String'];
  prices: Array<GqlHistoricalTokenPriceEntry>;
};

export type GqlHistoricalTokenPriceEntry = {
  __typename?: 'GqlHistoricalTokenPriceEntry';
  price: Scalars['Float'];
  timestamp: Scalars['String'];
};

export type GqlLatestSyncedBlocks = {
  __typename?: 'GqlLatestSyncedBlocks';
  poolSyncBlock: Scalars['BigInt'];
  userStakeSyncBlock: Scalars['BigInt'];
  userWalletSyncBlock: Scalars['BigInt'];
};

export type GqlLge = {
  __typename?: 'GqlLge';
  address: Scalars['String'];
  adminAddress: Scalars['String'];
  adminIsMultisig: Scalars['Boolean'];
  bannerImageUrl: Scalars['String'];
  collateralAddress: Scalars['String'];
  collateralAmount: Scalars['String'];
  collateralDecimals: Scalars['Int'];
  collateralEndWeight: Scalars['Int'];
  collateralStartWeight: Scalars['Int'];
  description: Scalars['String'];
  discordUrl: Scalars['String'];
  endTimestamp: Scalars['Int'];
  id: Scalars['ID'];
  mediumUrl: Scalars['String'];
  name: Scalars['String'];
  startTimestamp: Scalars['Int'];
  swapFee: Scalars['String'];
  telegramUrl: Scalars['String'];
  tokenAddress: Scalars['String'];
  tokenAmount: Scalars['String'];
  tokenDecimals: Scalars['Int'];
  tokenEndWeight: Scalars['Int'];
  tokenIconUrl: Scalars['String'];
  tokenStartWeight: Scalars['Int'];
  tokenSymbol: Scalars['String'];
  twitterUrl: Scalars['String'];
  websiteUrl: Scalars['String'];
};

export type GqlLgeCreateInput = {
  address: Scalars['String'];
  bannerImageUrl: Scalars['String'];
  collateralAddress: Scalars['String'];
  collateralAmount: Scalars['String'];
  collateralEndWeight: Scalars['Int'];
  collateralStartWeight: Scalars['Int'];
  description: Scalars['String'];
  discordUrl: Scalars['String'];
  endTimestamp: Scalars['Int'];
  id: Scalars['ID'];
  mediumUrl: Scalars['String'];
  name: Scalars['String'];
  startTimestamp: Scalars['Int'];
  swapFee: Scalars['String'];
  telegramUrl: Scalars['String'];
  tokenAddress: Scalars['String'];
  tokenAmount: Scalars['String'];
  tokenEndWeight: Scalars['Int'];
  tokenIconUrl: Scalars['String'];
  tokenStartWeight: Scalars['Int'];
  twitterUrl: Scalars['String'];
  websiteUrl: Scalars['String'];
};

export type GqlLgePriceData = {
  __typename?: 'GqlLgePriceData';
  price: Scalars['Float'];
  timestamp: Scalars['Int'];
  type: Scalars['String'];
};

export type GqlLgeUpdateInput = {
  description: Scalars['String'];
  discordUrl: Scalars['String'];
  id: Scalars['ID'];
  mediumUrl: Scalars['String'];
  name: Scalars['String'];
  telegramUrl: Scalars['String'];
  tokenIconUrl: Scalars['String'];
  twitterUrl: Scalars['String'];
  websiteUrl: Scalars['String'];
};

export type GqlPoolApr = {
  __typename?: 'GqlPoolApr';
  apr: GqlPoolAprValue;
  hasRewardApr: Scalars['Boolean'];
  items: Array<GqlBalancePoolAprItem>;
  nativeRewardApr: GqlPoolAprValue;
  swapApr: Scalars['BigDecimal'];
  thirdPartyApr: GqlPoolAprValue;
};

export type GqlPoolAprRange = {
  __typename?: 'GqlPoolAprRange';
  max: Scalars['BigDecimal'];
  min: Scalars['BigDecimal'];
};

export type GqlPoolAprTotal = {
  __typename?: 'GqlPoolAprTotal';
  total: Scalars['BigDecimal'];
};

export type GqlPoolAprValue = GqlPoolAprRange | GqlPoolAprTotal;

export type GqlPoolBase = {
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  name: Scalars['String'];
  owner?: Maybe<Scalars['Bytes']>;
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolBatchSwap = {
  __typename?: 'GqlPoolBatchSwap';
  id: Scalars['ID'];
  swaps: Array<GqlPoolBatchSwapSwap>;
  timestamp: Scalars['Int'];
  tokenAmountIn: Scalars['String'];
  tokenAmountOut: Scalars['String'];
  tokenIn: Scalars['String'];
  tokenInPrice: Scalars['Float'];
  tokenOut: Scalars['String'];
  tokenOutPrice: Scalars['Float'];
  tx: Scalars['String'];
  userAddress: Scalars['String'];
  valueUSD: Scalars['Float'];
};

export type GqlPoolBatchSwapPool = {
  __typename?: 'GqlPoolBatchSwapPool';
  id: Scalars['ID'];
  tokens: Array<Scalars['String']>;
};

export type GqlPoolBatchSwapSwap = {
  __typename?: 'GqlPoolBatchSwapSwap';
  id: Scalars['ID'];
  pool: GqlPoolMinimal;
  timestamp: Scalars['Int'];
  tokenAmountIn: Scalars['String'];
  tokenAmountOut: Scalars['String'];
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
  tx: Scalars['String'];
  userAddress: Scalars['String'];
  valueUSD: Scalars['Float'];
};

export type GqlPoolDynamicData = {
  __typename?: 'GqlPoolDynamicData';
  apr: GqlPoolApr;
  fees24h: Scalars['BigDecimal'];
  fees24hAth: Scalars['BigDecimal'];
  fees24hAthTimestamp: Scalars['Int'];
  fees24hAtl: Scalars['BigDecimal'];
  fees24hAtlTimestamp: Scalars['Int'];
  fees48h: Scalars['BigDecimal'];
  holdersCount: Scalars['BigInt'];
  lifetimeSwapFees: Scalars['BigDecimal'];
  lifetimeVolume: Scalars['BigDecimal'];
  poolId: Scalars['ID'];
  sharePriceAth: Scalars['BigDecimal'];
  sharePriceAthTimestamp: Scalars['Int'];
  sharePriceAtl: Scalars['BigDecimal'];
  sharePriceAtlTimestamp: Scalars['Int'];
  swapEnabled: Scalars['Boolean'];
  swapFee: Scalars['BigDecimal'];
  swapsCount: Scalars['BigInt'];
  totalLiquidity: Scalars['BigDecimal'];
  totalLiquidity24hAgo: Scalars['BigDecimal'];
  totalLiquidityAth: Scalars['BigDecimal'];
  totalLiquidityAthTimestamp: Scalars['Int'];
  totalLiquidityAtl: Scalars['BigDecimal'];
  totalLiquidityAtlTimestamp: Scalars['Int'];
  totalShares: Scalars['BigDecimal'];
  totalShares24hAgo: Scalars['BigDecimal'];
  volume24h: Scalars['BigDecimal'];
  volume24hAth: Scalars['BigDecimal'];
  volume24hAthTimestamp: Scalars['Int'];
  volume24hAtl: Scalars['BigDecimal'];
  volume24hAtlTimestamp: Scalars['Int'];
  volume48h: Scalars['BigDecimal'];
  yieldCapture24h: Scalars['BigDecimal'];
  yieldCapture48h: Scalars['BigDecimal'];
};

export type GqlPoolElement = GqlPoolBase & {
  __typename?: 'GqlPoolElement';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  baseToken: Scalars['Bytes'];
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  name: Scalars['String'];
  owner: Scalars['Bytes'];
  principalToken: Scalars['Bytes'];
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  tokens: Array<GqlPoolToken>;
  unitSeconds: Scalars['BigInt'];
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolFeaturedPoolGroup = {
  __typename?: 'GqlPoolFeaturedPoolGroup';
  icon: Scalars['String'];
  id: Scalars['ID'];
  items: Array<GqlPoolFeaturedPoolGroupItem>;
  title: Scalars['String'];
};

export type GqlPoolFeaturedPoolGroupItem =
  | GqlFeaturePoolGroupItemExternalLink
  | GqlPoolMinimal;

export type GqlPoolFilter = {
  categoryIn?: InputMaybe<Array<GqlPoolFilterCategory>>;
  categoryNotIn?: InputMaybe<Array<GqlPoolFilterCategory>>;
  chainIn?: InputMaybe<Array<GqlChain>>;
  chainNotIn?: InputMaybe<Array<GqlChain>>;
  filterIn?: InputMaybe<Array<Scalars['String']>>;
  filterNotIn?: InputMaybe<Array<Scalars['String']>>;
  idIn?: InputMaybe<Array<Scalars['String']>>;
  idNotIn?: InputMaybe<Array<Scalars['String']>>;
  poolTypeIn?: InputMaybe<Array<GqlPoolFilterType>>;
  poolTypeNotIn?: InputMaybe<Array<GqlPoolFilterType>>;
  tokensIn?: InputMaybe<Array<Scalars['String']>>;
  tokensNotIn?: InputMaybe<Array<Scalars['String']>>;
};

export enum GqlPoolFilterCategory {
  BlackListed = 'BLACK_LISTED',
  Incentivized = 'INCENTIVIZED',
}

export type GqlPoolFilterDefinition = {
  __typename?: 'GqlPoolFilterDefinition';
  id: Scalars['ID'];
  title: Scalars['String'];
};

export enum GqlPoolFilterType {
  Element = 'ELEMENT',
  Gyro = 'GYRO',
  Gyro3 = 'GYRO3',
  Gyroe = 'GYROE',
  Investment = 'INVESTMENT',
  Linear = 'LINEAR',
  LiquidityBootstrapping = 'LIQUIDITY_BOOTSTRAPPING',
  MetaStable = 'META_STABLE',
  PhantomStable = 'PHANTOM_STABLE',
  Stable = 'STABLE',
  Unknown = 'UNKNOWN',
  Weighted = 'WEIGHTED',
}

export type GqlPoolGyro = GqlPoolBase & {
  __typename?: 'GqlPoolGyro';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  alpha: Scalars['String'];
  beta: Scalars['String'];
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  name: Scalars['String'];
  nestingType: GqlPoolNestingType;
  owner: Scalars['Bytes'];
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  tokens: Array<GqlPoolTokenUnion>;
  type: Scalars['String'];
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolInvestConfig = {
  __typename?: 'GqlPoolInvestConfig';
  options: Array<GqlPoolInvestOption>;
  proportionalEnabled: Scalars['Boolean'];
  singleAssetEnabled: Scalars['Boolean'];
};

export type GqlPoolInvestOption = {
  __typename?: 'GqlPoolInvestOption';
  poolTokenAddress: Scalars['String'];
  poolTokenIndex: Scalars['Int'];
  tokenOptions: Array<GqlPoolToken>;
};

export type GqlPoolJoinExit = {
  __typename?: 'GqlPoolJoinExit';
  amounts: Array<GqlPoolJoinExitAmount>;
  id: Scalars['ID'];
  poolId: Scalars['String'];
  sender: Scalars['String'];
  timestamp: Scalars['Int'];
  tx: Scalars['String'];
  type: GqlPoolJoinExitType;
  valueUSD?: Maybe<Scalars['String']>;
};

export type GqlPoolJoinExitAmount = {
  __typename?: 'GqlPoolJoinExitAmount';
  address: Scalars['String'];
  amount: Scalars['String'];
};

export type GqlPoolJoinExitFilter = {
  poolIdIn?: InputMaybe<Array<Scalars['String']>>;
};

export enum GqlPoolJoinExitType {
  Exit = 'Exit',
  Join = 'Join',
}

export type GqlPoolLinear = GqlPoolBase & {
  __typename?: 'GqlPoolLinear';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  bptPriceRate: Scalars['BigDecimal'];
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  lowerTarget: Scalars['BigInt'];
  mainIndex: Scalars['Int'];
  name: Scalars['String'];
  owner: Scalars['Bytes'];
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  tokens: Array<GqlPoolToken>;
  upperTarget: Scalars['BigInt'];
  withdrawConfig: GqlPoolWithdrawConfig;
  wrappedIndex: Scalars['Int'];
};

export type GqlPoolLinearNested = {
  __typename?: 'GqlPoolLinearNested';
  address: Scalars['Bytes'];
  bptPriceRate: Scalars['BigDecimal'];
  createTime: Scalars['Int'];
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  lowerTarget: Scalars['BigInt'];
  mainIndex: Scalars['Int'];
  name: Scalars['String'];
  owner: Scalars['Bytes'];
  symbol: Scalars['String'];
  tokens: Array<GqlPoolToken>;
  totalLiquidity: Scalars['BigDecimal'];
  totalShares: Scalars['BigDecimal'];
  upperTarget: Scalars['BigInt'];
  wrappedIndex: Scalars['Int'];
};

export type GqlPoolLinearPoolData = {
  __typename?: 'GqlPoolLinearPoolData';
  address: Scalars['String'];
  balance: Scalars['String'];
  id: Scalars['ID'];
  mainToken: GqlPoolLinearPoolMainToken;
  mainTokenTotalBalance: Scalars['String'];
  poolToken: Scalars['String'];
  priceRate: Scalars['String'];
  symbol: Scalars['String'];
  totalSupply: Scalars['String'];
  unwrappedTokenAddress: Scalars['String'];
  wrappedToken: GqlPoolLinearPoolWrappedToken;
};

export type GqlPoolLinearPoolMainToken = {
  __typename?: 'GqlPoolLinearPoolMainToken';
  address: Scalars['String'];
  balance: Scalars['String'];
  decimals: Scalars['Int'];
  index: Scalars['Int'];
  name: Scalars['String'];
  symbol: Scalars['String'];
  totalSupply: Scalars['String'];
};

export type GqlPoolLinearPoolWrappedToken = {
  __typename?: 'GqlPoolLinearPoolWrappedToken';
  address: Scalars['String'];
  balance: Scalars['String'];
  decimals: Scalars['Int'];
  index: Scalars['Int'];
  name: Scalars['String'];
  priceRate: Scalars['String'];
  symbol: Scalars['String'];
  totalSupply: Scalars['String'];
};

export type GqlPoolLiquidityBootstrapping = GqlPoolBase & {
  __typename?: 'GqlPoolLiquidityBootstrapping';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  name: Scalars['String'];
  nestingType: GqlPoolNestingType;
  owner: Scalars['Bytes'];
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  tokens: Array<GqlPoolTokenUnion>;
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolMetaStable = GqlPoolBase & {
  __typename?: 'GqlPoolMetaStable';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  amp: Scalars['BigInt'];
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  name: Scalars['String'];
  owner: Scalars['Bytes'];
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  tokens: Array<GqlPoolToken>;
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolMinimal = {
  __typename?: 'GqlPoolMinimal';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  owner?: Maybe<Scalars['Bytes']>;
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  type: GqlPoolMinimalType;
  version: Scalars['Int'];
};

export enum GqlPoolMinimalType {
  Element = 'ELEMENT',
  Gyro = 'GYRO',
  Gyro3 = 'GYRO3',
  Gyroe = 'GYROE',
  Investment = 'INVESTMENT',
  Linear = 'LINEAR',
  LiquidityBootstrapping = 'LIQUIDITY_BOOTSTRAPPING',
  MetaStable = 'META_STABLE',
  PhantomStable = 'PHANTOM_STABLE',
  Stable = 'STABLE',
  Unknown = 'UNKNOWN',
  Weighted = 'WEIGHTED',
}

export type GqlPoolNestedUnion =
  | GqlPoolLinearNested
  | GqlPoolPhantomStableNested;

export enum GqlPoolNestingType {
  HasOnlyPhantomBpt = 'HAS_ONLY_PHANTOM_BPT',
  HasSomePhantomBpt = 'HAS_SOME_PHANTOM_BPT',
  NoNesting = 'NO_NESTING',
}

export enum GqlPoolOrderBy {
  Apr = 'apr',
  Fees24h = 'fees24h',
  TotalLiquidity = 'totalLiquidity',
  TotalShares = 'totalShares',
  Volume24h = 'volume24h',
}

export enum GqlPoolOrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type GqlPoolPhantomStable = GqlPoolBase & {
  __typename?: 'GqlPoolPhantomStable';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  amp: Scalars['BigInt'];
  bptPriceRate: Scalars['BigDecimal'];
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  name: Scalars['String'];
  nestingType: GqlPoolNestingType;
  owner: Scalars['Bytes'];
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  tokens: Array<GqlPoolTokenUnion>;
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolPhantomStableNested = {
  __typename?: 'GqlPoolPhantomStableNested';
  address: Scalars['Bytes'];
  amp: Scalars['BigInt'];
  bptPriceRate: Scalars['BigDecimal'];
  createTime: Scalars['Int'];
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  nestingType: GqlPoolNestingType;
  owner: Scalars['Bytes'];
  swapFee: Scalars['BigDecimal'];
  symbol: Scalars['String'];
  tokens: Array<GqlPoolTokenPhantomStableNestedUnion>;
  totalLiquidity: Scalars['BigDecimal'];
  totalShares: Scalars['BigDecimal'];
};

export type GqlPoolSnapshot = {
  __typename?: 'GqlPoolSnapshot';
  amounts: Array<Scalars['String']>;
  fees24h: Scalars['String'];
  holdersCount: Scalars['String'];
  id: Scalars['ID'];
  poolId: Scalars['String'];
  sharePrice: Scalars['String'];
  swapsCount: Scalars['String'];
  timestamp: Scalars['Int'];
  totalLiquidity: Scalars['String'];
  totalShares: Scalars['String'];
  totalSwapFee: Scalars['String'];
  totalSwapVolume: Scalars['String'];
  volume24h: Scalars['String'];
};

export enum GqlPoolSnapshotDataRange {
  AllTime = 'ALL_TIME',
  NinetyDays = 'NINETY_DAYS',
  OneHundredEightyDays = 'ONE_HUNDRED_EIGHTY_DAYS',
  OneYear = 'ONE_YEAR',
  ThirtyDays = 'THIRTY_DAYS',
}

export type GqlPoolStable = GqlPoolBase & {
  __typename?: 'GqlPoolStable';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  amp: Scalars['BigInt'];
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  name: Scalars['String'];
  owner: Scalars['Bytes'];
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  tokens: Array<GqlPoolToken>;
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolStablePhantomPoolData = {
  __typename?: 'GqlPoolStablePhantomPoolData';
  address: Scalars['String'];
  balance: Scalars['String'];
  id: Scalars['ID'];
  symbol: Scalars['String'];
  tokens: Array<GqlPoolToken>;
  totalSupply: Scalars['String'];
};

export type GqlPoolStaking = {
  __typename?: 'GqlPoolStaking';
  address: Scalars['String'];
  gauge?: Maybe<GqlPoolStakingGauge>;
  id: Scalars['ID'];
  type: GqlPoolStakingType;
};

export type GqlPoolStakingGauge = {
  __typename?: 'GqlPoolStakingGauge';
  gaugeAddress: Scalars['String'];
  id: Scalars['ID'];
  otherGauges?: Maybe<Array<GqlPoolStakingOtherGauge>>;
  rewards: Array<GqlPoolStakingGaugeReward>;
  status: GqlPoolStakingGaugeStatus;
  version: Scalars['Int'];
};

export type GqlPoolStakingGaugeReward = {
  __typename?: 'GqlPoolStakingGaugeReward';
  id: Scalars['ID'];
  rewardPerSecond: Scalars['String'];
  tokenAddress: Scalars['String'];
};

export enum GqlPoolStakingGaugeStatus {
  Active = 'ACTIVE',
  Killed = 'KILLED',
  Preferred = 'PREFERRED',
}

export type GqlPoolStakingOtherGauge = {
  __typename?: 'GqlPoolStakingOtherGauge';
  gaugeAddress: Scalars['String'];
  id: Scalars['ID'];
  rewards: Array<GqlPoolStakingGaugeReward>;
  status: GqlPoolStakingGaugeStatus;
  version: Scalars['Int'];
};

export enum GqlPoolStakingType {
  Gauge = 'GAUGE',
}

export type GqlPoolSwap = {
  __typename?: 'GqlPoolSwap';
  id: Scalars['ID'];
  poolId: Scalars['String'];
  timestamp: Scalars['Int'];
  tokenAmountIn: Scalars['String'];
  tokenAmountOut: Scalars['String'];
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
  tx: Scalars['String'];
  userAddress: Scalars['String'];
  valueUSD: Scalars['Float'];
};

export type GqlPoolSwapFilter = {
  poolIdIn?: InputMaybe<Array<Scalars['String']>>;
  tokenInIn?: InputMaybe<Array<Scalars['String']>>;
  tokenOutIn?: InputMaybe<Array<Scalars['String']>>;
};

export type GqlPoolToken = GqlPoolTokenBase & {
  __typename?: 'GqlPoolToken';
  address: Scalars['String'];
  balance: Scalars['BigDecimal'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  index: Scalars['Int'];
  name: Scalars['String'];
  priceRate: Scalars['BigDecimal'];
  symbol: Scalars['String'];
  totalBalance: Scalars['BigDecimal'];
  weight?: Maybe<Scalars['BigDecimal']>;
};

export type GqlPoolTokenBase = {
  address: Scalars['String'];
  balance: Scalars['BigDecimal'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  index: Scalars['Int'];
  name: Scalars['String'];
  priceRate: Scalars['BigDecimal'];
  symbol: Scalars['String'];
  totalBalance: Scalars['BigDecimal'];
  weight?: Maybe<Scalars['BigDecimal']>;
};

export type GqlPoolTokenDisplay = {
  __typename?: 'GqlPoolTokenDisplay';
  address: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  nestedTokens?: Maybe<Array<GqlPoolTokenDisplay>>;
  symbol: Scalars['String'];
  weight?: Maybe<Scalars['BigDecimal']>;
};

export type GqlPoolTokenExpanded = {
  __typename?: 'GqlPoolTokenExpanded';
  address: Scalars['String'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  isMainToken: Scalars['Boolean'];
  isNested: Scalars['Boolean'];
  isPhantomBpt: Scalars['Boolean'];
  name: Scalars['String'];
  symbol: Scalars['String'];
  weight?: Maybe<Scalars['String']>;
};

export type GqlPoolTokenLinear = GqlPoolTokenBase & {
  __typename?: 'GqlPoolTokenLinear';
  address: Scalars['String'];
  balance: Scalars['BigDecimal'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  index: Scalars['Int'];
  mainTokenBalance: Scalars['BigDecimal'];
  name: Scalars['String'];
  pool: GqlPoolLinearNested;
  priceRate: Scalars['BigDecimal'];
  symbol: Scalars['String'];
  totalBalance: Scalars['BigDecimal'];
  totalMainTokenBalance: Scalars['BigDecimal'];
  weight?: Maybe<Scalars['BigDecimal']>;
  wrappedTokenBalance: Scalars['BigDecimal'];
};

export type GqlPoolTokenPhantomStable = GqlPoolTokenBase & {
  __typename?: 'GqlPoolTokenPhantomStable';
  address: Scalars['String'];
  balance: Scalars['BigDecimal'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  index: Scalars['Int'];
  name: Scalars['String'];
  pool: GqlPoolPhantomStableNested;
  priceRate: Scalars['BigDecimal'];
  symbol: Scalars['String'];
  totalBalance: Scalars['BigDecimal'];
  weight?: Maybe<Scalars['BigDecimal']>;
};

export type GqlPoolTokenPhantomStableNestedUnion =
  | GqlPoolToken
  | GqlPoolTokenLinear;

export type GqlPoolTokenUnion =
  | GqlPoolToken
  | GqlPoolTokenLinear
  | GqlPoolTokenPhantomStable;

export type GqlPoolUnion =
  | GqlPoolElement
  | GqlPoolGyro
  | GqlPoolLinear
  | GqlPoolLiquidityBootstrapping
  | GqlPoolMetaStable
  | GqlPoolPhantomStable
  | GqlPoolStable
  | GqlPoolWeighted;

export type GqlPoolUserSwapVolume = {
  __typename?: 'GqlPoolUserSwapVolume';
  swapVolumeUSD: Scalars['BigDecimal'];
  userAddress: Scalars['String'];
};

export type GqlPoolWeighted = GqlPoolBase & {
  __typename?: 'GqlPoolWeighted';
  address: Scalars['Bytes'];
  allTokens: Array<GqlPoolTokenExpanded>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  investConfig: GqlPoolInvestConfig;
  name: Scalars['String'];
  nestingType: GqlPoolNestingType;
  owner: Scalars['Bytes'];
  staking?: Maybe<GqlPoolStaking>;
  symbol: Scalars['String'];
  tokens: Array<GqlPoolTokenUnion>;
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolWithdrawConfig = {
  __typename?: 'GqlPoolWithdrawConfig';
  options: Array<GqlPoolWithdrawOption>;
  proportionalEnabled: Scalars['Boolean'];
  singleAssetEnabled: Scalars['Boolean'];
};

export type GqlPoolWithdrawOption = {
  __typename?: 'GqlPoolWithdrawOption';
  poolTokenAddress: Scalars['String'];
  poolTokenIndex: Scalars['Int'];
  tokenOptions: Array<GqlPoolToken>;
};

export type GqlProtocolMetricsAggregated = {
  __typename?: 'GqlProtocolMetricsAggregated';
  chains: Array<GqlProtocolMetricsChain>;
  numLiquidityProviders: Scalars['BigInt'];
  poolCount: Scalars['BigInt'];
  swapFee7d: Scalars['BigDecimal'];
  swapFee24h: Scalars['BigDecimal'];
  swapVolume7d: Scalars['BigDecimal'];
  swapVolume24h: Scalars['BigDecimal'];
  totalLiquidity: Scalars['BigDecimal'];
  totalSwapFee: Scalars['BigDecimal'];
  totalSwapVolume: Scalars['BigDecimal'];
  yieldCapture24h: Scalars['BigDecimal'];
};

export type GqlProtocolMetricsChain = {
  __typename?: 'GqlProtocolMetricsChain';
  chainId: Scalars['String'];
  numLiquidityProviders: Scalars['BigInt'];
  poolCount: Scalars['BigInt'];
  swapFee7d: Scalars['BigDecimal'];
  swapFee24h: Scalars['BigDecimal'];
  swapVolume7d: Scalars['BigDecimal'];
  swapVolume24h: Scalars['BigDecimal'];
  totalLiquidity: Scalars['BigDecimal'];
  totalSwapFee: Scalars['BigDecimal'];
  totalSwapVolume: Scalars['BigDecimal'];
  yieldCapture24h: Scalars['BigDecimal'];
};

export type GqlSorGetBatchSwapForTokensInResponse = {
  __typename?: 'GqlSorGetBatchSwapForTokensInResponse';
  assets: Array<Scalars['String']>;
  swaps: Array<GqlSorSwap>;
  tokenOutAmount: Scalars['AmountHumanReadable'];
};

export type GqlSorGetSwapsResponse = {
  __typename?: 'GqlSorGetSwapsResponse';
  effectivePrice: Scalars['AmountHumanReadable'];
  effectivePriceReversed: Scalars['AmountHumanReadable'];
  marketSp: Scalars['String'];
  priceImpact: Scalars['AmountHumanReadable'];
  returnAmount: Scalars['AmountHumanReadable'];
  returnAmountConsideringFees: Scalars['BigDecimal'];
  returnAmountFromSwaps?: Maybe<Scalars['BigDecimal']>;
  returnAmountScaled: Scalars['BigDecimal'];
  routes: Array<GqlSorSwapRoute>;
  swapAmount: Scalars['AmountHumanReadable'];
  swapAmountForSwaps?: Maybe<Scalars['BigDecimal']>;
  swapAmountScaled: Scalars['BigDecimal'];
  swapType: GqlSorSwapType;
  swaps: Array<GqlSorSwap>;
  tokenAddresses: Array<Scalars['String']>;
  tokenIn: Scalars['String'];
  tokenInAmount: Scalars['AmountHumanReadable'];
  tokenOut: Scalars['String'];
  tokenOutAmount: Scalars['AmountHumanReadable'];
};

export type GqlSorSwap = {
  __typename?: 'GqlSorSwap';
  amount: Scalars['String'];
  assetInIndex: Scalars['Int'];
  assetOutIndex: Scalars['Int'];
  poolId: Scalars['String'];
  userData: Scalars['String'];
};

export type GqlSorSwapOptionsInput = {
  forceRefresh?: InputMaybe<Scalars['Boolean']>;
  maxPools?: InputMaybe<Scalars['Int']>;
  timestamp?: InputMaybe<Scalars['Int']>;
};

export type GqlSorSwapRoute = {
  __typename?: 'GqlSorSwapRoute';
  hops: Array<GqlSorSwapRouteHop>;
  share: Scalars['Float'];
  tokenIn: Scalars['String'];
  tokenInAmount: Scalars['BigDecimal'];
  tokenOut: Scalars['String'];
  tokenOutAmount: Scalars['BigDecimal'];
};

export type GqlSorSwapRouteHop = {
  __typename?: 'GqlSorSwapRouteHop';
  pool: GqlPoolMinimal;
  poolId: Scalars['String'];
  tokenIn: Scalars['String'];
  tokenInAmount: Scalars['BigDecimal'];
  tokenOut: Scalars['String'];
  tokenOutAmount: Scalars['BigDecimal'];
};

export enum GqlSorSwapType {
  ExactIn = 'EXACT_IN',
  ExactOut = 'EXACT_OUT',
}

export type GqlToken = {
  __typename?: 'GqlToken';
  address: Scalars['String'];
  chainId: Scalars['Int'];
  decimals: Scalars['Int'];
  description?: Maybe<Scalars['String']>;
  discordUrl?: Maybe<Scalars['String']>;
  logoURI?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  priority: Scalars['Int'];
  symbol: Scalars['String'];
  telegramUrl?: Maybe<Scalars['String']>;
  tradable: Scalars['Boolean'];
  twitterUsername?: Maybe<Scalars['String']>;
  websiteUrl?: Maybe<Scalars['String']>;
};

export type GqlTokenAmountHumanReadable = {
  address: Scalars['String'];
  amount: Scalars['AmountHumanReadable'];
};

export type GqlTokenCandlestickChartDataItem = {
  __typename?: 'GqlTokenCandlestickChartDataItem';
  close: Scalars['AmountHumanReadable'];
  high: Scalars['AmountHumanReadable'];
  id: Scalars['ID'];
  low: Scalars['AmountHumanReadable'];
  open: Scalars['AmountHumanReadable'];
  timestamp: Scalars['Int'];
};

export enum GqlTokenChartDataRange {
  SevenDay = 'SEVEN_DAY',
  ThirtyDay = 'THIRTY_DAY',
}

export type GqlTokenData = {
  __typename?: 'GqlTokenData';
  description?: Maybe<Scalars['String']>;
  discordUrl?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  telegramUrl?: Maybe<Scalars['String']>;
  tokenAddress: Scalars['String'];
  twitterUsername?: Maybe<Scalars['String']>;
  websiteUrl?: Maybe<Scalars['String']>;
};

export type GqlTokenDynamicData = {
  __typename?: 'GqlTokenDynamicData';
  ath: Scalars['Float'];
  atl: Scalars['Float'];
  fdv?: Maybe<Scalars['String']>;
  high24h: Scalars['Float'];
  id: Scalars['String'];
  low24h: Scalars['Float'];
  marketCap?: Maybe<Scalars['String']>;
  price: Scalars['Float'];
  priceChange24h: Scalars['Float'];
  priceChangePercent7d?: Maybe<Scalars['Float']>;
  priceChangePercent14d?: Maybe<Scalars['Float']>;
  priceChangePercent24h: Scalars['Float'];
  priceChangePercent30d?: Maybe<Scalars['Float']>;
  tokenAddress: Scalars['String'];
  updatedAt: Scalars['String'];
};

export type GqlTokenPrice = {
  __typename?: 'GqlTokenPrice';
  address: Scalars['String'];
  price: Scalars['Float'];
};

export type GqlTokenPriceChartDataItem = {
  __typename?: 'GqlTokenPriceChartDataItem';
  id: Scalars['ID'];
  price: Scalars['AmountHumanReadable'];
  timestamp: Scalars['Int'];
};

export enum GqlTokenType {
  Bpt = 'BPT',
  LinearWrappedToken = 'LINEAR_WRAPPED_TOKEN',
  PhantomBpt = 'PHANTOM_BPT',
  WhiteListed = 'WHITE_LISTED',
}

export type GqlUserPoolBalance = {
  __typename?: 'GqlUserPoolBalance';
  poolId: Scalars['String'];
  stakedBalance: Scalars['AmountHumanReadable'];
  tokenAddress: Scalars['String'];
  tokenPrice: Scalars['Float'];
  totalBalance: Scalars['AmountHumanReadable'];
  walletBalance: Scalars['AmountHumanReadable'];
};

export type GqlUserSwapVolumeFilter = {
  poolIdIn?: InputMaybe<Array<Scalars['String']>>;
  tokenInIn?: InputMaybe<Array<Scalars['String']>>;
  tokenOutIn?: InputMaybe<Array<Scalars['String']>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  balancerMutationTest: Scalars['String'];
  cacheAverageBlockTime: Scalars['String'];
  lgeCreate: GqlLge;
  lgeSyncFromSanity: Scalars['String'];
  poolBlackListAddPool: Scalars['String'];
  poolBlackListRemovePool: Scalars['String'];
  poolDeletePool: Scalars['String'];
  poolInitializeSnapshotsForPool: Scalars['String'];
  poolLoadOnChainDataForAllPools: Scalars['String'];
  poolLoadOnChainDataForPoolsWithActiveUpdates: Scalars['String'];
  poolLoadSnapshotsForAllPools: Scalars['String'];
  poolLoadSnapshotsForPools: Scalars['String'];
  poolReloadAllPoolAprs: Scalars['String'];
  poolReloadAllTokenNestedPoolIds: Scalars['String'];
  poolReloadPoolNestedTokens: Scalars['String'];
  poolReloadPoolTokenIndexes: Scalars['String'];
  poolReloadStakingForAllPools: Scalars['String'];
  poolSetPoolsWithPreferredGaugesAsIncentivized: Scalars['String'];
  poolSyncAllPoolVersions: Scalars['String'];
  poolSyncAllPoolsFromSubgraph: Array<Scalars['String']>;
  poolSyncLatestSnapshotsForAllPools: Scalars['String'];
  poolSyncNewPoolsFromSubgraph: Array<Scalars['String']>;
  poolSyncPool: Scalars['String'];
  poolSyncPoolAllTokensRelationship: Scalars['String'];
  poolSyncSanityPoolData: Scalars['String'];
  poolSyncStakingForPools: Scalars['String'];
  poolSyncSwapsForLast48Hours: Scalars['String'];
  poolSyncTotalShares: Scalars['String'];
  poolUpdateAprs: Scalars['String'];
  poolUpdateLifetimeValuesForAllPools: Scalars['String'];
  poolUpdateLiquidity24hAgoForAllPools: Scalars['String'];
  poolUpdateLiquidityValuesForAllPools: Scalars['String'];
  poolUpdateVolumeAndFeeValuesForAllPools: Scalars['String'];
  protocolCacheMetrics: Scalars['String'];
  tokenDeletePrice: Scalars['Boolean'];
  tokenDeleteTokenType: Scalars['String'];
  tokenInitChartData: Scalars['String'];
  tokenReloadAllTokenTypes: Scalars['String'];
  tokenReloadTokenPrices?: Maybe<Scalars['Boolean']>;
  tokenSyncTokenDefinitions: Scalars['String'];
  tokenSyncTokenDynamicData: Scalars['String'];
  userInitStakedBalances: Scalars['String'];
  userInitWalletBalancesForAllPools: Scalars['String'];
  userInitWalletBalancesForPool: Scalars['String'];
  userSyncBalance: Scalars['String'];
  userSyncBalanceAllPools: Scalars['String'];
  userSyncChangedStakedBalances: Scalars['String'];
  userSyncChangedWalletBalancesForAllPools: Scalars['String'];
  veBalSyncAllUserBalances: Scalars['String'];
  veBalSyncTotalSupply: Scalars['String'];
};

export type MutationLgeCreateArgs = {
  lge: GqlLgeCreateInput;
};

export type MutationPoolBlackListAddPoolArgs = {
  poolId: Scalars['String'];
};

export type MutationPoolBlackListRemovePoolArgs = {
  poolId: Scalars['String'];
};

export type MutationPoolDeletePoolArgs = {
  poolId: Scalars['String'];
};

export type MutationPoolInitializeSnapshotsForPoolArgs = {
  poolId: Scalars['String'];
};

export type MutationPoolLoadSnapshotsForPoolsArgs = {
  poolIds: Array<Scalars['String']>;
  reload?: InputMaybe<Scalars['Boolean']>;
};

export type MutationPoolReloadPoolNestedTokensArgs = {
  poolId: Scalars['String'];
};

export type MutationPoolReloadPoolTokenIndexesArgs = {
  poolId: Scalars['String'];
};

export type MutationPoolReloadStakingForAllPoolsArgs = {
  stakingTypes: Array<GqlPoolStakingType>;
};

export type MutationPoolSyncLatestSnapshotsForAllPoolsArgs = {
  daysToSync?: InputMaybe<Scalars['Int']>;
};

export type MutationPoolSyncPoolArgs = {
  poolId: Scalars['String'];
};

export type MutationTokenDeletePriceArgs = {
  timestamp: Scalars['Int'];
  tokenAddress: Scalars['String'];
};

export type MutationTokenDeleteTokenTypeArgs = {
  tokenAddress: Scalars['String'];
  type: GqlTokenType;
};

export type MutationTokenInitChartDataArgs = {
  tokenAddress: Scalars['String'];
};

export type MutationUserInitStakedBalancesArgs = {
  stakingTypes: Array<GqlPoolStakingType>;
};

export type MutationUserInitWalletBalancesForPoolArgs = {
  poolId: Scalars['String'];
};

export type MutationUserSyncBalanceArgs = {
  poolId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  balancerQueryTest: Scalars['String'];
  blocksGetAverageBlockTime: Scalars['Float'];
  blocksGetBlocksPerDay: Scalars['Float'];
  blocksGetBlocksPerSecond: Scalars['Float'];
  blocksGetBlocksPerYear: Scalars['Float'];
  contentGetNewsItems: Array<GqlContentNewsItem>;
  latestSyncedBlocks: GqlLatestSyncedBlocks;
  lge: GqlLge;
  lgeGetChartData: Array<Maybe<GqlLgePriceData>>;
  lges: Array<GqlLge>;
  poolGetAllPoolsSnapshots: Array<GqlPoolSnapshot>;
  poolGetBatchSwaps: Array<GqlPoolBatchSwap>;
  poolGetFeaturedPoolGroups: Array<GqlPoolFeaturedPoolGroup>;
  poolGetJoinExits: Array<GqlPoolJoinExit>;
  poolGetLinearPools: Array<GqlPoolLinear>;
  poolGetPool: GqlPoolBase;
  poolGetPoolFilters: Array<GqlPoolFilterDefinition>;
  poolGetPools: Array<GqlPoolMinimal>;
  poolGetPoolsCount: Scalars['Int'];
  poolGetSnapshots: Array<GqlPoolSnapshot>;
  poolGetSwaps: Array<GqlPoolSwap>;
  poolGetUserSwapVolume: Array<GqlPoolUserSwapVolume>;
  protocolMetricsAggregated: GqlProtocolMetricsAggregated;
  protocolMetricsChain: GqlProtocolMetricsChain;
  sorGetBatchSwapForTokensIn: GqlSorGetBatchSwapForTokensInResponse;
  sorGetSwaps: GqlSorGetSwapsResponse;
  tokenGetCandlestickChartData: Array<GqlTokenCandlestickChartDataItem>;
  tokenGetCurrentPrices: Array<GqlTokenPrice>;
  tokenGetHistoricalPrices: Array<GqlHistoricalTokenPrice>;
  tokenGetPriceChartData: Array<GqlTokenPriceChartDataItem>;
  tokenGetProtocolTokenPrice: Scalars['AmountHumanReadable'];
  tokenGetRelativePriceChartData: Array<GqlTokenPriceChartDataItem>;
  tokenGetTokenData?: Maybe<GqlTokenData>;
  tokenGetTokenDynamicData?: Maybe<GqlTokenDynamicData>;
  tokenGetTokens: Array<GqlToken>;
  tokenGetTokensData: Array<GqlTokenData>;
  tokenGetTokensDynamicData: Array<GqlTokenDynamicData>;
  userGetPoolBalances: Array<GqlUserPoolBalance>;
  userGetPoolJoinExits: Array<GqlPoolJoinExit>;
  userGetStaking: Array<GqlPoolStaking>;
  userGetSwaps: Array<GqlPoolSwap>;
  veBalGetTotalSupply: Scalars['AmountHumanReadable'];
  veBalGetUserBalance: Scalars['AmountHumanReadable'];
};

export type QueryLgeArgs = {
  id: Scalars['ID'];
};

export type QueryLgeGetChartDataArgs = {
  id: Scalars['ID'];
};

export type QueryPoolGetAllPoolsSnapshotsArgs = {
  range: GqlPoolSnapshotDataRange;
};

export type QueryPoolGetBatchSwapsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlPoolSwapFilter>;
};

export type QueryPoolGetJoinExitsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlPoolJoinExitFilter>;
};

export type QueryPoolGetPoolArgs = {
  id: Scalars['String'];
};

export type QueryPoolGetPoolsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GqlPoolOrderBy>;
  orderDirection?: InputMaybe<GqlPoolOrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  textSearch?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<GqlPoolFilter>;
};

export type QueryPoolGetPoolsCountArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GqlPoolOrderBy>;
  orderDirection?: InputMaybe<GqlPoolOrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  textSearch?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<GqlPoolFilter>;
};

export type QueryPoolGetSnapshotsArgs = {
  id: Scalars['String'];
  range: GqlPoolSnapshotDataRange;
};

export type QueryPoolGetSwapsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlPoolSwapFilter>;
};

export type QueryPoolGetUserSwapVolumeArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlUserSwapVolumeFilter>;
};

export type QueryProtocolMetricsAggregatedArgs = {
  chainIds: Array<Scalars['String']>;
};

export type QuerySorGetBatchSwapForTokensInArgs = {
  swapOptions: GqlSorSwapOptionsInput;
  tokenOut: Scalars['String'];
  tokensIn: Array<GqlTokenAmountHumanReadable>;
};

export type QuerySorGetSwapsArgs = {
  swapAmount: Scalars['BigDecimal'];
  swapOptions: GqlSorSwapOptionsInput;
  swapType: GqlSorSwapType;
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
};

export type QueryTokenGetCandlestickChartDataArgs = {
  address: Scalars['String'];
  range: GqlTokenChartDataRange;
};

export type QueryTokenGetHistoricalPricesArgs = {
  addresses: Array<Scalars['String']>;
};

export type QueryTokenGetPriceChartDataArgs = {
  address: Scalars['String'];
  range: GqlTokenChartDataRange;
};

export type QueryTokenGetRelativePriceChartDataArgs = {
  range: GqlTokenChartDataRange;
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
};

export type QueryTokenGetTokenDataArgs = {
  address: Scalars['String'];
};

export type QueryTokenGetTokenDynamicDataArgs = {
  address: Scalars['String'];
};

export type QueryTokenGetTokensDataArgs = {
  addresses: Array<Scalars['String']>;
};

export type QueryTokenGetTokensDynamicDataArgs = {
  addresses: Array<Scalars['String']>;
};

export type QueryUserGetPoolJoinExitsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  poolId: Scalars['String'];
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryUserGetSwapsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  poolId: Scalars['String'];
  skip?: InputMaybe<Scalars['Int']>;
};

export type GetCurrentTokenPricesQueryVariables = Exact<{
  [key: string]: never;
}>;

export type GetCurrentTokenPricesQuery = {
  __typename?: 'Query';
  prices: Array<{
    __typename?: 'GqlTokenPrice';
    price: number;
    address: string;
  }>;
};

export const GetCurrentTokenPricesDocument = gql`
  query GetCurrentTokenPrices {
    prices: tokenGetCurrentPrices {
      price
      address
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    GetCurrentTokenPrices(
      variables?: GetCurrentTokenPricesQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<GetCurrentTokenPricesQuery> {
      return withWrapper(
        wrappedRequestHeaders =>
          client.request<GetCurrentTokenPricesQuery>(
            GetCurrentTokenPricesDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GetCurrentTokenPrices',
        'query'
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
