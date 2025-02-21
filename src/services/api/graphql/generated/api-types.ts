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

/** The review data for the ERC4626 token */
export type Erc4626ReviewData = {
  __typename?: 'Erc4626ReviewData';
  /** The filename of the review of the ERC4626 */
  reviewFile: Scalars['String'];
  /** A summary of the ERC4626 review, usually just says safe or unsafe */
  summary: Scalars['String'];
  /** Warnings associated with the ERC4626 */
  warnings: Array<Scalars['String']>;
};

/** ExitFee hook specific params. Percentage format is 0.01 -> 0.01%. */
export type ExitFeeHookParams = {
  __typename?: 'ExitFeeHookParams';
  exitFeePercentage?: Maybe<Scalars['String']>;
};

/** FeeTaking hook specific params. Percentage format is 0.01 -> 0.01% */
export type FeeTakingHookParams = {
  __typename?: 'FeeTakingHookParams';
  addLiquidityFeePercentage?: Maybe<Scalars['String']>;
  removeLiquidityFeePercentage?: Maybe<Scalars['String']>;
  swapFeePercentage?: Maybe<Scalars['String']>;
};

export type GqlAggregatorPoolFilter = {
  chainIn?: InputMaybe<Array<GqlChain>>;
  chainNotIn?: InputMaybe<Array<GqlChain>>;
  createTime?: InputMaybe<GqlPoolTimePeriod>;
  idIn?: InputMaybe<Array<Scalars['String']>>;
  idNotIn?: InputMaybe<Array<Scalars['String']>>;
  includeHooks?: InputMaybe<Array<GqlHookType>>;
  minTvl?: InputMaybe<Scalars['Float']>;
  poolTypeIn?: InputMaybe<Array<GqlPoolType>>;
  poolTypeNotIn?: InputMaybe<Array<GqlPoolType>>;
  protocolVersionIn?: InputMaybe<Array<Scalars['Int']>>;
  tokensIn?: InputMaybe<Array<Scalars['String']>>;
  tokensNotIn?: InputMaybe<Array<Scalars['String']>>;
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
  Base = 'BASE',
  Fantom = 'FANTOM',
  Fraxtal = 'FRAXTAL',
  Gnosis = 'GNOSIS',
  Mainnet = 'MAINNET',
  Mode = 'MODE',
  Optimism = 'OPTIMISM',
  Polygon = 'POLYGON',
  Sepolia = 'SEPOLIA',
  Sonic = 'SONIC',
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
  chain: GqlChain;
  prices: Array<GqlHistoricalTokenPriceEntry>;
};

export type GqlHistoricalTokenPriceEntry = {
  __typename?: 'GqlHistoricalTokenPriceEntry';
  price: Scalars['Float'];
  timestamp: Scalars['String'];
  updatedAt: Scalars['Int'];
  updatedBy?: Maybe<Scalars['String']>;
};

/** Hook data */
export type GqlHook = {
  __typename?: 'GqlHook';
  address: Scalars['String'];
  config?: Maybe<HookConfig>;
  /** @deprecated No longer supported */
  dynamicData?: Maybe<GqlHookData>;
  /** @deprecated No longer supported */
  enableHookAdjustedAmounts: Scalars['Boolean'];
  /** @deprecated unused */
  name: Scalars['String'];
  /** Hook type specific params */
  params?: Maybe<HookParams>;
  /** The review for this hook if applicable. */
  reviewData?: Maybe<GqlHookReviewData>;
  /** @deprecated No longer supported */
  shouldCallAfterAddLiquidity: Scalars['Boolean'];
  /** @deprecated No longer supported */
  shouldCallAfterInitialize: Scalars['Boolean'];
  /** @deprecated No longer supported */
  shouldCallAfterRemoveLiquidity: Scalars['Boolean'];
  /** @deprecated No longer supported */
  shouldCallAfterSwap: Scalars['Boolean'];
  /** @deprecated No longer supported */
  shouldCallBeforeAddLiquidity: Scalars['Boolean'];
  /** @deprecated No longer supported */
  shouldCallBeforeInitialize: Scalars['Boolean'];
  /** @deprecated No longer supported */
  shouldCallBeforeRemoveLiquidity: Scalars['Boolean'];
  /** @deprecated No longer supported */
  shouldCallBeforeSwap: Scalars['Boolean'];
  /** @deprecated No longer supported */
  shouldCallComputeDynamicSwapFee: Scalars['Boolean'];
  type: GqlHookType;
};

export type GqlHookData = {
  __typename?: 'GqlHookData';
  addLiquidityFeePercentage?: Maybe<Scalars['String']>;
  maxSurgeFeePercentage?: Maybe<Scalars['String']>;
  removeLiquidityFeePercentage?: Maybe<Scalars['String']>;
  surgeThresholdPercentage?: Maybe<Scalars['String']>;
  swapFeePercentage?: Maybe<Scalars['String']>;
};

/** Represents the review data for the hook */
export type GqlHookReviewData = {
  __typename?: 'GqlHookReviewData';
  /** The filename of the review of the hook */
  reviewFile: Scalars['String'];
  /** A summary of the hook review, usually just says safe or unsafe */
  summary: Scalars['String'];
  /** Warnings associated with the hook */
  warnings: Array<Scalars['String']>;
};

export enum GqlHookType {
  DirectionalFee = 'DIRECTIONAL_FEE',
  ExitFee = 'EXIT_FEE',
  FeeTaking = 'FEE_TAKING',
  Lottery = 'LOTTERY',
  MevTax = 'MEV_TAX',
  NftliquidityPosition = 'NFTLIQUIDITY_POSITION',
  StableSurge = 'STABLE_SURGE',
  Unknown = 'UNKNOWN',
  VebalDiscount = 'VEBAL_DISCOUNT',
}

export type GqlLatestSyncedBlocks = {
  __typename?: 'GqlLatestSyncedBlocks';
  poolSyncBlock: Scalars['BigInt'];
  userStakeSyncBlock: Scalars['BigInt'];
  userWalletSyncBlock: Scalars['BigInt'];
};

/** All info on the nested pool if the token is a BPT. It will only support 1 level of nesting. */
export type GqlNestedPool = {
  __typename?: 'GqlNestedPool';
  /** Address of the pool. */
  address: Scalars['Bytes'];
  /** Price rate of this pool or the Balancer Pool Token (BPT). */
  bptPriceRate: Scalars['BigDecimal'];
  /** Timestamp of when the pool was created. */
  createTime: Scalars['Int'];
  /** Address of the factory contract that created the pool, if applicable. */
  factory?: Maybe<Scalars['Bytes']>;
  /** Hook assigned to a pool */
  hook?: Maybe<GqlHook>;
  /** Unique identifier of the pool. */
  id: Scalars['ID'];
  /** Liquidity management settings for v3 pools. */
  liquidityManagement?: Maybe<LiquidityManagement>;
  /** Name of the pool. */
  name: Scalars['String'];
  /** Total liquidity of the parent pool in the nested pool in USD. */
  nestedLiquidity: Scalars['BigDecimal'];
  /** Percentage of the parents pool shares inside the nested pool. */
  nestedPercentage: Scalars['BigDecimal'];
  /** Number of shares of the parent pool in the nested pool. */
  nestedShares: Scalars['BigDecimal'];
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  /** Fee charged for swapping tokens in the pool as %. 0.01 -> 0.01% */
  swapFee: Scalars['BigDecimal'];
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  /** Symbol of the pool. */
  symbol: Scalars['String'];
  /** List of all tokens in the pool. */
  tokens: Array<GqlPoolTokenDetail>;
  /** Total liquidity in the pool in USD. */
  totalLiquidity: Scalars['BigDecimal'];
  /** Total number of shares in the pool. */
  totalShares: Scalars['BigDecimal'];
  /** Type of the pool. */
  type: GqlPoolType;
  /** Version of the pool. */
  version: Scalars['Int'];
};

/** Represents an event that occurs when liquidity is added or removed from a pool. */
export type GqlPoolAddRemoveEventV3 = GqlPoolEvent & {
  __typename?: 'GqlPoolAddRemoveEventV3';
  /** The block number of the event. */
  blockNumber: Scalars['Int'];
  /** The block timestamp of the event. */
  blockTimestamp: Scalars['Int'];
  /** The chain on which the event occurred. */
  chain: GqlChain;
  /** The unique identifier of the event. */
  id: Scalars['ID'];
  /** The log index of the event. */
  logIndex: Scalars['Int'];
  /** The pool ID associated with the event. */
  poolId: Scalars['String'];
  /** The sender of the event. */
  sender: Scalars['String'];
  /** The timestamp of the event. */
  timestamp: Scalars['Int'];
  /** The tokens involved in the event. Ordered by poolToken index. */
  tokens: Array<GqlPoolEventAmount>;
  /** The transaction hash of the event. */
  tx: Scalars['String'];
  /** The type of the event. */
  type: GqlPoolEventType;
  /** The user address associated with the event. */
  userAddress: Scalars['String'];
  /** The value of the event in USD. */
  valueUSD: Scalars['Float'];
};

export type GqlPoolAggregator = {
  __typename?: 'GqlPoolAggregator';
  /** The contract address of the pool. */
  address: Scalars['Bytes'];
  /** Data specific to gyro/fx pools */
  alpha?: Maybe<Scalars['String']>;
  /** Data specific to stable pools */
  amp?: Maybe<Scalars['BigInt']>;
  /** Data specific to gyro/fx pools */
  beta?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  c?: Maybe<Scalars['String']>;
  /** The chain on which the pool is deployed */
  chain: GqlChain;
  /** The timestamp the pool was created. */
  createTime: Scalars['Int'];
  /** Data specific to gyro pools */
  dSq?: Maybe<Scalars['String']>;
  /** The decimals of the BPT, usually 18 */
  decimals: Scalars['Int'];
  /** Data specific to fx pools */
  delta?: Maybe<Scalars['String']>;
  /** Dynamic data such as token balances, swap fees or volume */
  dynamicData: GqlPoolDynamicData;
  /** Data specific to fx pools */
  epsilon?: Maybe<Scalars['String']>;
  /** The factory contract address from which the pool was created. */
  factory?: Maybe<Scalars['Bytes']>;
  /** Hook assigned to a pool */
  hook?: Maybe<GqlHook>;
  /** The pool id. This is equal to the address for protocolVersion 3 pools */
  id: Scalars['ID'];
  /** Data specific to gyro/fx pools */
  lambda?: Maybe<Scalars['String']>;
  /** Liquidity management settings for v3 pools. */
  liquidityManagement?: Maybe<LiquidityManagement>;
  /** The name of the pool as per contract */
  name: Scalars['String'];
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  /** Returns all pool tokens, including BPTs and nested pools if there are any. Only one nested level deep. */
  poolTokens: Array<GqlPoolTokenDetail>;
  /** The protocol version on which the pool is deployed, 1, 2 or 3 */
  protocolVersion: Scalars['Int'];
  /** Data specific to gyro pools */
  root3Alpha?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  s?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  sqrtAlpha?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  sqrtBeta?: Maybe<Scalars['String']>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  /** The token symbol of the pool as per contract */
  symbol: Scalars['String'];
  /** Data specific to gyro pools */
  tauAlphaX?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  tauAlphaY?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  tauBetaX?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  tauBetaY?: Maybe<Scalars['String']>;
  /** The pool type, such as weighted, stable, etc. */
  type: GqlPoolType;
  /** Data specific to gyro pools */
  u?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  v?: Maybe<Scalars['String']>;
  /** The version of the pool type. */
  version: Scalars['Int'];
  /** Data specific to gyro pools */
  w?: Maybe<Scalars['String']>;
  /** Data specific to gyro pools */
  z?: Maybe<Scalars['String']>;
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

/** All APRs for a pool */
export type GqlPoolAprItem = {
  __typename?: 'GqlPoolAprItem';
  /** The APR value in % -> 0.2 = 0.2% */
  apr: Scalars['Float'];
  /** The id of the APR item */
  id: Scalars['ID'];
  /** The reward token address, if the APR originates from token emissions */
  rewardTokenAddress?: Maybe<Scalars['String']>;
  /** The reward token symbol, if the APR originates from token emissions */
  rewardTokenSymbol?: Maybe<Scalars['String']>;
  /**
   * The title of the APR item, a human readable form
   * @deprecated No replacement, should be built client side
   */
  title: Scalars['String'];
  /** Specific type of this APR */
  type: GqlPoolAprItemType;
};

/** Enum representing the different types of the APR in a pool. */
export enum GqlPoolAprItemType {
  /** APR that pools earns when BPT is staked on AURA. */
  Aura = 'AURA',
  /** Represents the yield from an IB (Interest-Bearing) asset APR in a pool. */
  IbYield = 'IB_YIELD',
  /** APR in a pool that can be earned through locking, i.e. veBAL */
  Locking = 'LOCKING',
  /** Reward APR in a pool from maBEETS emissions allocated by gauge votes. Emitted in BEETS. */
  MabeetsEmissions = 'MABEETS_EMISSIONS',
  /** Rewards distributed by merkl.xyz */
  Merkl = 'MERKL',
  /** Represents if the APR items comes from a nested pool. */
  Nested = 'NESTED',
  /** Staking reward APR in a pool from a reward token. */
  Staking = 'STAKING',
  /** APR boost that can be earned, i.e. via veBAL or maBEETS. */
  StakingBoost = 'STAKING_BOOST',
  /** Cow AMM specific APR */
  Surplus = 'SURPLUS',
  /** Surplus APR based on data from the last 7d */
  Surplus_7D = 'SURPLUS_7D',
  /** Surplus APR based on data from the last 24h */
  Surplus_24H = 'SURPLUS_24H',
  /** Surplus APR based on data from the last 30d */
  Surplus_30D = 'SURPLUS_30D',
  /** Represents the swap fee APR in a pool. */
  SwapFee = 'SWAP_FEE',
  /** Swap fee APR based on data from the last 7d */
  SwapFee_7D = 'SWAP_FEE_7D',
  /** Swap fee APR based on data from the last 24h */
  SwapFee_24H = 'SWAP_FEE_24H',
  /** Swap fee APR based on data from the last 30d */
  SwapFee_30D = 'SWAP_FEE_30D',
  /** Reward APR in a pool from veBAL emissions allocated by gauge votes. Emitted in BAL. */
  VebalEmissions = 'VEBAL_EMISSIONS',
  /** APR that can be earned thourgh voting, i.e. gauge votes */
  Voting = 'VOTING',
}

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

/** The base type as returned by poolGetPool (specific pool query) */
export type GqlPoolBase = {
  /** The contract address of the pool. */
  address: Scalars['Bytes'];
  /**
   * Returns all pool tokens, including any nested tokens and phantom BPTs as a flattened array.
   * @deprecated Use poolTokens instead
   */
  allTokens: Array<GqlPoolTokenExpanded>;
  /** List of categories assigned by the team based on external factors */
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  /** The chain on which the pool is deployed */
  chain: GqlChain;
  /** The timestamp the pool was created. */
  createTime: Scalars['Int'];
  /** The decimals of the BPT, usually 18 */
  decimals: Scalars['Int'];
  /**
   * Only returns main tokens, also known as leave tokens. Wont return any nested BPTs. Used for displaying the tokens that the pool consists of.
   * @deprecated Use poolTokens instead
   */
  displayTokens: Array<GqlPoolTokenDisplay>;
  /** Dynamic data such as token balances, swap fees or volume */
  dynamicData: GqlPoolDynamicData;
  /** The factory contract address from which the pool was created. */
  factory?: Maybe<Scalars['Bytes']>;
  /** Whether at least one token in this pool is considered an ERC4626 token and the buffer is allowed. */
  hasAnyAllowedBuffer: Scalars['Boolean'];
  /** Whether at least one token in this pool is considered an ERC4626 token. */
  hasErc4626: Scalars['Boolean'];
  /** Whether at least one token in a nested pool is considered an ERC4626 token. */
  hasNestedErc4626: Scalars['Boolean'];
  /** Hook assigned to a pool */
  hook?: Maybe<GqlHook>;
  /** The pool id. This is equal to the address for protocolVersion 3 pools */
  id: Scalars['ID'];
  /**
   * Deprecated
   * @deprecated Removed without replacement
   */
  investConfig: GqlPoolInvestConfig;
  /** Liquidity management settings for v3 pools. */
  liquidityManagement?: Maybe<LiquidityManagement>;
  /** The name of the pool as per contract */
  name: Scalars['String'];
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  /** Returns pool tokens, including BPTs and nested pools and their pool tokens if there are any. Only one nested level deep. */
  poolTokens: Array<GqlPoolTokenDetail>;
  /** The protocol version on which the pool is deployed, 1, 2 or 3 */
  protocolVersion: Scalars['Int'];
  /** Staking options of this pool which emit additional rewards */
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  /** The token symbol of the pool as per contract */
  symbol: Scalars['String'];
  /** List of tags assigned by the team based on external factors */
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The pool type, such as weighted, stable, etc. */
  type: GqlPoolType;
  /** If a user address was provided in the query, the user balance is populated here */
  userBalance?: Maybe<GqlPoolUserBalance>;
  /**
   * The vault version on which the pool is deployed, 2 or 3
   * @deprecated use protocolVersion instead
   */
  vaultVersion: Scalars['Int'];
  /** The version of the pool type. */
  version: Scalars['Int'];
  /**
   * Deprecated
   * @deprecated Removed without replacement
   */
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolBatchSwap = {
  __typename?: 'GqlPoolBatchSwap';
  chain: GqlChain;
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
  pool: PoolForBatchSwap;
  timestamp: Scalars['Int'];
  tokenAmountIn: Scalars['String'];
  tokenAmountOut: Scalars['String'];
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
  tx: Scalars['String'];
  userAddress: Scalars['String'];
  valueUSD: Scalars['Float'];
};

export type GqlPoolComposableStable = GqlPoolBase & {
  __typename?: 'GqlPoolComposableStable';
  address: Scalars['Bytes'];
  /** @deprecated Use poolTokens instead */
  allTokens: Array<GqlPoolTokenExpanded>;
  amp: Scalars['BigInt'];
  bptPriceRate: Scalars['BigDecimal'];
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  /** @deprecated Use poolTokens instead */
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  hasAnyAllowedBuffer: Scalars['Boolean'];
  hasErc4626: Scalars['Boolean'];
  hasNestedErc4626: Scalars['Boolean'];
  hook?: Maybe<GqlHook>;
  id: Scalars['ID'];
  /** @deprecated Removed without replacement */
  investConfig: GqlPoolInvestConfig;
  liquidityManagement?: Maybe<LiquidityManagement>;
  name: Scalars['String'];
  /** @deprecated Removed without replacement */
  nestingType: GqlPoolNestingType;
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  poolTokens: Array<GqlPoolTokenDetail>;
  protocolVersion: Scalars['Int'];
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * All tokens of the pool. If it is a nested pool, the nested pool is expanded with its own tokens again.
   * @deprecated Use poolTokens instead
   */
  tokens: Array<GqlPoolTokenUnion>;
  type: GqlPoolType;
  userBalance?: Maybe<GqlPoolUserBalance>;
  /** @deprecated use protocolVersion instead */
  vaultVersion: Scalars['Int'];
  version: Scalars['Int'];
  /** @deprecated Removed without replacement */
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolComposableStableNested = {
  __typename?: 'GqlPoolComposableStableNested';
  address: Scalars['Bytes'];
  amp: Scalars['BigInt'];
  bptPriceRate: Scalars['BigDecimal'];
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  createTime: Scalars['Int'];
  factory?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  name: Scalars['String'];
  /** @deprecated Removed without replacement */
  nestingType: GqlPoolNestingType;
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  swapFee: Scalars['BigDecimal'];
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** @deprecated Use poolTokens instead */
  tokens: Array<GqlPoolTokenComposableStableNestedUnion>;
  totalLiquidity: Scalars['BigDecimal'];
  totalShares: Scalars['BigDecimal'];
  type: GqlPoolType;
  version: Scalars['Int'];
};

export type GqlPoolDynamicData = {
  __typename?: 'GqlPoolDynamicData';
  /** Protocol and pool creator fees combined */
  aggregateSwapFee: Scalars['BigDecimal'];
  /** Protocol and pool creator fees combined */
  aggregateYieldFee: Scalars['BigDecimal'];
  /** @deprecated Use aprItems instead */
  apr: GqlPoolApr;
  aprItems: Array<GqlPoolAprItem>;
  fees24h: Scalars['BigDecimal'];
  fees24hAth: Scalars['BigDecimal'];
  fees24hAthTimestamp: Scalars['Int'];
  fees24hAtl: Scalars['BigDecimal'];
  fees24hAtlTimestamp: Scalars['Int'];
  fees48h: Scalars['BigDecimal'];
  holdersCount: Scalars['BigInt'];
  /** True for bricked pools */
  isInRecoveryMode: Scalars['Boolean'];
  isPaused: Scalars['Boolean'];
  lifetimeSwapFees: Scalars['BigDecimal'];
  lifetimeVolume: Scalars['BigDecimal'];
  poolId: Scalars['ID'];
  sharePriceAth: Scalars['BigDecimal'];
  sharePriceAthTimestamp: Scalars['Int'];
  sharePriceAtl: Scalars['BigDecimal'];
  sharePriceAtlTimestamp: Scalars['Int'];
  /** CowAmm specific, equivalent of swap fees */
  surplus24h: Scalars['BigDecimal'];
  /** CowAmm specific, equivalent of swap fees */
  surplus48h: Scalars['BigDecimal'];
  /** Disabled for bricked pools */
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
  totalSupply: Scalars['BigDecimal'];
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
  /** @deprecated Use poolTokens instead */
  allTokens: Array<GqlPoolTokenExpanded>;
  baseToken: Scalars['Bytes'];
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  /** @deprecated Use poolTokens instead */
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  hasAnyAllowedBuffer: Scalars['Boolean'];
  hasErc4626: Scalars['Boolean'];
  hasNestedErc4626: Scalars['Boolean'];
  hook?: Maybe<GqlHook>;
  id: Scalars['ID'];
  /** @deprecated Removed without replacement */
  investConfig: GqlPoolInvestConfig;
  liquidityManagement?: Maybe<LiquidityManagement>;
  name: Scalars['String'];
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  poolTokens: Array<GqlPoolTokenDetail>;
  principalToken: Scalars['Bytes'];
  protocolVersion: Scalars['Int'];
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** @deprecated Use poolTokens instead */
  tokens: Array<GqlPoolToken>;
  type: GqlPoolType;
  unitSeconds: Scalars['BigInt'];
  userBalance?: Maybe<GqlPoolUserBalance>;
  /** @deprecated use protocolVersion instead */
  vaultVersion: Scalars['Int'];
  version: Scalars['Int'];
  /** @deprecated Removed without replacement */
  withdrawConfig: GqlPoolWithdrawConfig;
};

/** Represents an event that occurs in a pool. */
export type GqlPoolEvent = {
  /** The block number of the event. */
  blockNumber: Scalars['Int'];
  /** The block timestamp of the event. */
  blockTimestamp: Scalars['Int'];
  /** The chain on which the event occurred. */
  chain: GqlChain;
  /** The unique identifier of the event. */
  id: Scalars['ID'];
  /** The log index of the event. */
  logIndex: Scalars['Int'];
  /** The pool ID associated with the event. */
  poolId: Scalars['String'];
  /** The sender of the event. */
  sender: Scalars['String'];
  /** The timestamp of the event. */
  timestamp: Scalars['Int'];
  /** The transaction hash of the event. */
  tx: Scalars['String'];
  /** The type of the event. */
  type: GqlPoolEventType;
  /** The user address associated with the event. */
  userAddress: Scalars['String'];
  /** The USD value of this event. */
  valueUSD: Scalars['Float'];
};

export type GqlPoolEventAmount = {
  __typename?: 'GqlPoolEventAmount';
  address: Scalars['String'];
  amount: Scalars['String'];
  valueUSD: Scalars['Float'];
};

export enum GqlPoolEventType {
  Add = 'ADD',
  Remove = 'REMOVE',
  Swap = 'SWAP',
}

export enum GqlPoolEventsDataRange {
  NinetyDays = 'NINETY_DAYS',
  SevenDays = 'SEVEN_DAYS',
  ThirtyDays = 'THIRTY_DAYS',
}

export type GqlPoolEventsFilter = {
  chainIn?: InputMaybe<Array<InputMaybe<GqlChain>>>;
  poolIdIn?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  range?: InputMaybe<GqlPoolEventsDataRange>;
  typeIn?: InputMaybe<Array<InputMaybe<GqlPoolEventType>>>;
  userAddress?: InputMaybe<Scalars['String']>;
  /** USD value of the event */
  valueUSD_gt?: InputMaybe<Scalars['Float']>;
  /** USD value of the event */
  valueUSD_gte?: InputMaybe<Scalars['Float']>;
};

export type GqlPoolFeaturedPool = {
  __typename?: 'GqlPoolFeaturedPool';
  description: Scalars['String'];
  pool: GqlPoolBase;
  poolId: Scalars['ID'];
  primary: Scalars['Boolean'];
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
  chainIn?: InputMaybe<Array<GqlChain>>;
  chainNotIn?: InputMaybe<Array<GqlChain>>;
  createTime?: InputMaybe<GqlPoolTimePeriod>;
  idIn?: InputMaybe<Array<Scalars['String']>>;
  idNotIn?: InputMaybe<Array<Scalars['String']>>;
  minTvl?: InputMaybe<Scalars['Float']>;
  poolTypeIn?: InputMaybe<Array<GqlPoolType>>;
  poolTypeNotIn?: InputMaybe<Array<GqlPoolType>>;
  protocolVersionIn?: InputMaybe<Array<Scalars['Int']>>;
  /**
   * For list of tags see: https://github.com/balancer/metadata/blob/main/pools/index.json
   * Use uppercase
   */
  tagIn?: InputMaybe<Array<Scalars['String']>>;
  /**
   * For list of tags see: https://github.com/balancer/metadata/blob/main/pools/index.json
   * Use uppercase
   */
  tagNotIn?: InputMaybe<Array<Scalars['String']>>;
  tokensIn?: InputMaybe<Array<Scalars['String']>>;
  tokensNotIn?: InputMaybe<Array<Scalars['String']>>;
  userAddress?: InputMaybe<Scalars['String']>;
};

export enum GqlPoolFilterCategory {
  BlackListed = 'BLACK_LISTED',
  Incentivized = 'INCENTIVIZED',
  Lrt = 'LRT',
  Points = 'POINTS',
  PointsEigenlayer = 'POINTS_EIGENLAYER',
  PointsGyro = 'POINTS_GYRO',
  PointsKelp = 'POINTS_KELP',
  PointsRenzo = 'POINTS_RENZO',
  PointsSwell = 'POINTS_SWELL',
  Superfest = 'SUPERFEST',
}

export type GqlPoolFx = GqlPoolBase & {
  __typename?: 'GqlPoolFx';
  address: Scalars['Bytes'];
  /** @deprecated Use poolTokens instead */
  allTokens: Array<GqlPoolTokenExpanded>;
  alpha: Scalars['String'];
  beta: Scalars['String'];
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  delta: Scalars['String'];
  /** @deprecated Use poolTokens instead */
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  epsilon: Scalars['String'];
  factory?: Maybe<Scalars['Bytes']>;
  hasAnyAllowedBuffer: Scalars['Boolean'];
  hasErc4626: Scalars['Boolean'];
  hasNestedErc4626: Scalars['Boolean'];
  hook?: Maybe<GqlHook>;
  id: Scalars['ID'];
  /** @deprecated Removed without replacement */
  investConfig: GqlPoolInvestConfig;
  lambda: Scalars['String'];
  liquidityManagement?: Maybe<LiquidityManagement>;
  name: Scalars['String'];
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  poolTokens: Array<GqlPoolTokenDetail>;
  protocolVersion: Scalars['Int'];
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * All tokens of the pool. If it is a nested pool, the nested pool is expanded with its own tokens again.
   * @deprecated Use poolTokens instead
   */
  tokens: Array<GqlPoolTokenUnion>;
  type: GqlPoolType;
  userBalance?: Maybe<GqlPoolUserBalance>;
  /** @deprecated use protocolVersion instead */
  vaultVersion: Scalars['Int'];
  version: Scalars['Int'];
  /** @deprecated Removed without replacement */
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolGyro = GqlPoolBase & {
  __typename?: 'GqlPoolGyro';
  address: Scalars['Bytes'];
  /** @deprecated Use poolTokens instead */
  allTokens: Array<GqlPoolTokenExpanded>;
  alpha: Scalars['String'];
  beta: Scalars['String'];
  c: Scalars['String'];
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  dSq: Scalars['String'];
  decimals: Scalars['Int'];
  /** @deprecated Use poolTokens instead */
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  hasAnyAllowedBuffer: Scalars['Boolean'];
  hasErc4626: Scalars['Boolean'];
  hasNestedErc4626: Scalars['Boolean'];
  hook?: Maybe<GqlHook>;
  id: Scalars['ID'];
  /** @deprecated Removed without replacement */
  investConfig: GqlPoolInvestConfig;
  lambda: Scalars['String'];
  liquidityManagement?: Maybe<LiquidityManagement>;
  name: Scalars['String'];
  /** @deprecated Removed without replacement */
  nestingType: GqlPoolNestingType;
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  poolTokens: Array<GqlPoolTokenDetail>;
  protocolVersion: Scalars['Int'];
  root3Alpha: Scalars['String'];
  s: Scalars['String'];
  sqrtAlpha: Scalars['String'];
  sqrtBeta: Scalars['String'];
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  tauAlphaX: Scalars['String'];
  tauAlphaY: Scalars['String'];
  tauBetaX: Scalars['String'];
  tauBetaY: Scalars['String'];
  /**
   * All tokens of the pool. If it is a nested pool, the nested pool is expanded with its own tokens again.
   * @deprecated Use poolTokens instead
   */
  tokens: Array<GqlPoolTokenUnion>;
  type: GqlPoolType;
  u: Scalars['String'];
  userBalance?: Maybe<GqlPoolUserBalance>;
  v: Scalars['String'];
  /** @deprecated use protocolVersion instead */
  vaultVersion: Scalars['Int'];
  version: Scalars['Int'];
  w: Scalars['String'];
  /** @deprecated Removed without replacement */
  withdrawConfig: GqlPoolWithdrawConfig;
  z: Scalars['String'];
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
  chain: GqlChain;
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
  chainIn?: InputMaybe<Array<GqlChain>>;
  poolIdIn?: InputMaybe<Array<Scalars['String']>>;
};

export enum GqlPoolJoinExitType {
  Exit = 'Exit',
  Join = 'Join',
}

export type GqlPoolLiquidityBootstrapping = GqlPoolBase & {
  __typename?: 'GqlPoolLiquidityBootstrapping';
  address: Scalars['Bytes'];
  /** @deprecated Use poolTokens instead */
  allTokens: Array<GqlPoolTokenExpanded>;
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  /** @deprecated Use poolTokens instead */
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  hasAnyAllowedBuffer: Scalars['Boolean'];
  hasErc4626: Scalars['Boolean'];
  hasNestedErc4626: Scalars['Boolean'];
  hook?: Maybe<GqlHook>;
  id: Scalars['ID'];
  /** @deprecated Removed without replacement */
  investConfig: GqlPoolInvestConfig;
  liquidityManagement?: Maybe<LiquidityManagement>;
  name: Scalars['String'];
  /** @deprecated Removed without replacement */
  nestingType: GqlPoolNestingType;
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  poolTokens: Array<GqlPoolTokenDetail>;
  protocolVersion: Scalars['Int'];
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * All tokens of the pool. If it is a nested pool, the nested pool is expanded with its own tokens again.
   * @deprecated Use poolTokens instead
   */
  tokens: Array<GqlPoolTokenUnion>;
  type: GqlPoolType;
  userBalance?: Maybe<GqlPoolUserBalance>;
  /** @deprecated use protocolVersion instead */
  vaultVersion: Scalars['Int'];
  version: Scalars['Int'];
  /** @deprecated Removed without replacement */
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolMetaStable = GqlPoolBase & {
  __typename?: 'GqlPoolMetaStable';
  address: Scalars['Bytes'];
  /** @deprecated Use poolTokens instead */
  allTokens: Array<GqlPoolTokenExpanded>;
  amp: Scalars['BigInt'];
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  /** @deprecated Use poolTokens instead */
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  hasAnyAllowedBuffer: Scalars['Boolean'];
  hasErc4626: Scalars['Boolean'];
  hasNestedErc4626: Scalars['Boolean'];
  hook?: Maybe<GqlHook>;
  id: Scalars['ID'];
  /** @deprecated Removed without replacement */
  investConfig: GqlPoolInvestConfig;
  liquidityManagement?: Maybe<LiquidityManagement>;
  name: Scalars['String'];
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  poolTokens: Array<GqlPoolTokenDetail>;
  protocolVersion: Scalars['Int'];
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** @deprecated Use poolTokens instead */
  tokens: Array<GqlPoolToken>;
  type: GqlPoolType;
  userBalance?: Maybe<GqlPoolUserBalance>;
  /** @deprecated use protocolVersion instead */
  vaultVersion: Scalars['Int'];
  version: Scalars['Int'];
  /** @deprecated Removed without replacement */
  withdrawConfig: GqlPoolWithdrawConfig;
};

/** The pool schema returned for poolGetPools (pool list query) */
export type GqlPoolMinimal = {
  __typename?: 'GqlPoolMinimal';
  /** The contract address of the pool. */
  address: Scalars['Bytes'];
  /**
   * Returns all pool tokens, including any nested tokens and phantom BPTs
   * @deprecated Use poolTokens instead
   */
  allTokens: Array<GqlPoolTokenExpanded>;
  /** List of categories assigned by the team based on external factors */
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  /** The chain on which the pool is deployed */
  chain: GqlChain;
  /** The timestamp the pool was created. */
  createTime: Scalars['Int'];
  /** The decimals of the BPT, usually 18 */
  decimals: Scalars['Int'];
  /**
   * Only returns main or underlying tokens, also known as leave tokens. Wont return any nested BPTs. Used for displaying the tokens that the pool consists of.
   * @deprecated Use poolTokens instead
   */
  displayTokens: Array<GqlPoolTokenDisplay>;
  /** Dynamic data such as token balances, swap fees or volume */
  dynamicData: GqlPoolDynamicData;
  /** The factory contract address from which the pool was created. */
  factory?: Maybe<Scalars['Bytes']>;
  /** Whether at least one token in this pool is considered an ERC4626 token and the buffer is allowed. */
  hasAnyAllowedBuffer: Scalars['Boolean'];
  /** Whether at least one token in this pool is considered an ERC4626 token. */
  hasErc4626: Scalars['Boolean'];
  /** Whether at least one token in a nested pool is considered an ERC4626 token. */
  hasNestedErc4626: Scalars['Boolean'];
  /** Hook assigned to a pool */
  hook?: Maybe<GqlHook>;
  /** The pool id. This is equal to the address for protocolVersion 3 pools */
  id: Scalars['ID'];
  /** Pool is receiving rewards when liquidity tokens are staked */
  incentivized: Scalars['Boolean'];
  /** Liquidity management settings for v3 pools. */
  liquidityManagement?: Maybe<LiquidityManagement>;
  /** The name of the pool as per contract */
  name: Scalars['String'];
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  /** Returns all pool tokens, including BPTs and nested pools if there are any. Only one nested level deep. */
  poolTokens: Array<GqlPoolTokenDetail>;
  /** The protocol version on which the pool is deployed, 1, 2 or 3 */
  protocolVersion: Scalars['Int'];
  /** Staking options of this pool which emit additional rewards */
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  /** The token symbol of the pool as per contract */
  symbol: Scalars['String'];
  /** List of tags assigned by the team based on external factors */
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The pool type, such as weighted, stable, etc. */
  type: GqlPoolType;
  /** If a user address was provided in the query, the user balance is populated here */
  userBalance?: Maybe<GqlPoolUserBalance>;
  /**
   * The vault version on which the pool is deployed, 2 or 3
   * @deprecated use protocolVersion instead
   */
  vaultVersion: Scalars['Int'];
  /** The version of the pool type. */
  version: Scalars['Int'];
};

/** Result of the poolReloadPools mutation */
export type GqlPoolMutationResult = {
  __typename?: 'GqlPoolMutationResult';
  /** The chain that was reloaded. */
  chain: GqlChain;
  /** The error message */
  error?: Maybe<Scalars['String']>;
  /** Whether it was successful or not. */
  success: Scalars['Boolean'];
  /** The type of pools that were reloaded. */
  type: Scalars['String'];
};

export type GqlPoolNestedUnion = GqlPoolComposableStableNested;

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
  UserbalanceUsd = 'userbalanceUsd',
  Volume24h = 'volume24h',
}

export enum GqlPoolOrderDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export type GqlPoolSnapshot = {
  __typename?: 'GqlPoolSnapshot';
  amounts: Array<Scalars['String']>;
  chain: GqlChain;
  fees24h: Scalars['String'];
  holdersCount: Scalars['String'];
  id: Scalars['ID'];
  poolId: Scalars['String'];
  sharePrice: Scalars['String'];
  surplus24h: Scalars['String'];
  swapsCount: Scalars['String'];
  timestamp: Scalars['Int'];
  totalLiquidity: Scalars['String'];
  totalShares: Scalars['String'];
  totalSurplus: Scalars['String'];
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
  /** @deprecated Use poolTokens instead */
  allTokens: Array<GqlPoolTokenExpanded>;
  amp: Scalars['BigInt'];
  bptPriceRate: Scalars['BigDecimal'];
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  /** @deprecated Use poolTokens instead */
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  hasAnyAllowedBuffer: Scalars['Boolean'];
  hasErc4626: Scalars['Boolean'];
  hasNestedErc4626: Scalars['Boolean'];
  hook?: Maybe<GqlHook>;
  id: Scalars['ID'];
  /** @deprecated Removed without replacement */
  investConfig: GqlPoolInvestConfig;
  liquidityManagement?: Maybe<LiquidityManagement>;
  name: Scalars['String'];
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  poolTokens: Array<GqlPoolTokenDetail>;
  protocolVersion: Scalars['Int'];
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** @deprecated Use poolTokens instead */
  tokens: Array<GqlPoolToken>;
  type: GqlPoolType;
  userBalance?: Maybe<GqlPoolUserBalance>;
  /** @deprecated use protocolVersion instead */
  vaultVersion: Scalars['Int'];
  version: Scalars['Int'];
  /** @deprecated Removed without replacement */
  withdrawConfig: GqlPoolWithdrawConfig;
};

export type GqlPoolStaking = {
  __typename?: 'GqlPoolStaking';
  address: Scalars['String'];
  aura?: Maybe<GqlPoolStakingAura>;
  chain: GqlChain;
  farm?: Maybe<GqlPoolStakingMasterChefFarm>;
  gauge?: Maybe<GqlPoolStakingGauge>;
  id: Scalars['ID'];
  reliquary?: Maybe<GqlPoolStakingReliquaryFarm>;
  type: GqlPoolStakingType;
  vebal?: Maybe<GqlPoolStakingVebal>;
};

export type GqlPoolStakingAura = {
  __typename?: 'GqlPoolStakingAura';
  apr: Scalars['Float'];
  auraPoolAddress: Scalars['String'];
  auraPoolId: Scalars['String'];
  id: Scalars['ID'];
  isShutdown: Scalars['Boolean'];
};

export type GqlPoolStakingFarmRewarder = {
  __typename?: 'GqlPoolStakingFarmRewarder';
  address: Scalars['String'];
  id: Scalars['ID'];
  rewardPerSecond: Scalars['String'];
  tokenAddress: Scalars['String'];
};

export type GqlPoolStakingGauge = {
  __typename?: 'GqlPoolStakingGauge';
  gaugeAddress: Scalars['String'];
  id: Scalars['ID'];
  otherGauges?: Maybe<Array<GqlPoolStakingOtherGauge>>;
  rewards: Array<GqlPoolStakingGaugeReward>;
  status: GqlPoolStakingGaugeStatus;
  version: Scalars['Int'];
  workingSupply: Scalars['String'];
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

export type GqlPoolStakingMasterChefFarm = {
  __typename?: 'GqlPoolStakingMasterChefFarm';
  beetsPerBlock: Scalars['String'];
  id: Scalars['ID'];
  rewarders?: Maybe<Array<GqlPoolStakingFarmRewarder>>;
};

export type GqlPoolStakingOtherGauge = {
  __typename?: 'GqlPoolStakingOtherGauge';
  gaugeAddress: Scalars['String'];
  id: Scalars['ID'];
  rewards: Array<GqlPoolStakingGaugeReward>;
  status: GqlPoolStakingGaugeStatus;
  version: Scalars['Int'];
};

export type GqlPoolStakingReliquaryFarm = {
  __typename?: 'GqlPoolStakingReliquaryFarm';
  beetsPerSecond: Scalars['String'];
  id: Scalars['ID'];
  levels?: Maybe<Array<GqlPoolStakingReliquaryFarmLevel>>;
  totalBalance: Scalars['String'];
  totalWeightedBalance: Scalars['String'];
};

export type GqlPoolStakingReliquaryFarmLevel = {
  __typename?: 'GqlPoolStakingReliquaryFarmLevel';
  allocationPoints: Scalars['Int'];
  apr: Scalars['BigDecimal'];
  balance: Scalars['BigDecimal'];
  id: Scalars['ID'];
  level: Scalars['Int'];
  requiredMaturity: Scalars['Int'];
};

export enum GqlPoolStakingType {
  Aura = 'AURA',
  FreshBeets = 'FRESH_BEETS',
  Gauge = 'GAUGE',
  MasterChef = 'MASTER_CHEF',
  Reliquary = 'RELIQUARY',
  Vebal = 'VEBAL',
}

export type GqlPoolStakingVebal = {
  __typename?: 'GqlPoolStakingVebal';
  id: Scalars['ID'];
  vebalAddress: Scalars['String'];
};

export type GqlPoolSwap = {
  __typename?: 'GqlPoolSwap';
  chain: GqlChain;
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

/** Represents an event that occurs when a swap is made in a pool using the CowAmm protocol. */
export type GqlPoolSwapEventCowAmm = GqlPoolEvent & {
  __typename?: 'GqlPoolSwapEventCowAmm';
  /** The block number of the event. */
  blockNumber: Scalars['Int'];
  /** The block timestamp of the event. */
  blockTimestamp: Scalars['Int'];
  /** The chain on which the event occurred. */
  chain: GqlChain;
  /** The fee that this swap generated. */
  fee: GqlPoolEventAmount;
  /** The unique identifier of the event. */
  id: Scalars['ID'];
  /** The log index of the event. */
  logIndex: Scalars['Int'];
  /** The pool ID associated with the event. */
  poolId: Scalars['String'];
  /** The sender of the event. */
  sender: Scalars['String'];
  /** The surplus generated by the swap. */
  surplus: GqlPoolEventAmount;
  /** The timestamp of the event. */
  timestamp: Scalars['Int'];
  /** The token that was swapped in the event. */
  tokenIn: GqlPoolEventAmount;
  /** The token that was swapped out in the event. */
  tokenOut: GqlPoolEventAmount;
  /** The transaction hash of the event. */
  tx: Scalars['String'];
  /** The type of the event. */
  type: GqlPoolEventType;
  /** The user address associated with the event. */
  userAddress: Scalars['String'];
  /** The value of the event in USD. */
  valueUSD: Scalars['Float'];
};

/** Represents an event that occurs when a swap is made in a pool. */
export type GqlPoolSwapEventV3 = GqlPoolEvent & {
  __typename?: 'GqlPoolSwapEventV3';
  /** The block number of the event. */
  blockNumber: Scalars['Int'];
  /** The block timestamp of the event. */
  blockTimestamp: Scalars['Int'];
  /** The chain on which the event occurred. */
  chain: GqlChain;
  /** The fee that this swap generated. */
  fee: GqlPoolEventAmount;
  /** The unique identifier of the event. */
  id: Scalars['ID'];
  /** The log index of the event. */
  logIndex: Scalars['Int'];
  /** The pool ID associated with the event. */
  poolId: Scalars['String'];
  /** The sender of the event. */
  sender: Scalars['String'];
  /** The timestamp of the event. */
  timestamp: Scalars['Int'];
  /** The token that was swapped in the event. */
  tokenIn: GqlPoolEventAmount;
  /** The token that was swapped out in the event. */
  tokenOut: GqlPoolEventAmount;
  /** The transaction hash of the event. */
  tx: Scalars['String'];
  /** The type of the event. */
  type: GqlPoolEventType;
  /** The user address associated with the event. */
  userAddress: Scalars['String'];
  /** The value of the event in USD. */
  valueUSD: Scalars['Float'];
};

export type GqlPoolSwapFilter = {
  chainIn?: InputMaybe<Array<GqlChain>>;
  poolIdIn?: InputMaybe<Array<Scalars['String']>>;
  tokenInIn?: InputMaybe<Array<Scalars['String']>>;
  tokenOutIn?: InputMaybe<Array<Scalars['String']>>;
};

export type GqlPoolTimePeriod = {
  gt?: InputMaybe<Scalars['Int']>;
  lt?: InputMaybe<Scalars['Int']>;
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
  priceRateProvider?: Maybe<Scalars['String']>;
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
  priceRateProvider?: Maybe<Scalars['String']>;
  symbol: Scalars['String'];
  totalBalance: Scalars['BigDecimal'];
  weight?: Maybe<Scalars['BigDecimal']>;
};

export type GqlPoolTokenComposableStable = GqlPoolTokenBase & {
  __typename?: 'GqlPoolTokenComposableStable';
  address: Scalars['String'];
  balance: Scalars['BigDecimal'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  index: Scalars['Int'];
  name: Scalars['String'];
  pool: GqlPoolComposableStableNested;
  priceRate: Scalars['BigDecimal'];
  priceRateProvider?: Maybe<Scalars['String']>;
  symbol: Scalars['String'];
  totalBalance: Scalars['BigDecimal'];
  weight?: Maybe<Scalars['BigDecimal']>;
};

export type GqlPoolTokenComposableStableNestedUnion = GqlPoolToken;

/**
 * All info on the pool token. It will also include the nested pool if the token is a BPT. It will only support 1 level of nesting.
 * A second (unsupported) level of nesting is shown by having hasNestedPool = true but nestedPool = null.
 */
export type GqlPoolTokenDetail = {
  __typename?: 'GqlPoolTokenDetail';
  /** Address of the pool token. */
  address: Scalars['String'];
  /** Balance of the pool token inside the pool. */
  balance: Scalars['BigDecimal'];
  /** USD Balance of the pool token. */
  balanceUSD: Scalars['BigDecimal'];
  /** If it is an ERC4626 token, this defines whether we can use wrap/unwrap through the buffer in swap paths for this token. */
  canUseBufferForSwaps?: Maybe<Scalars['Boolean']>;
  chain?: Maybe<GqlChain>;
  chainId?: Maybe<Scalars['Int']>;
  /** Coingecko ID */
  coingeckoId?: Maybe<Scalars['String']>;
  /** Decimals of the pool token. */
  decimals: Scalars['Int'];
  /** The ERC4626 review data for the token */
  erc4626ReviewData?: Maybe<Erc4626ReviewData>;
  /** Indicates whether this token is a BPT and therefor has a nested pool. */
  hasNestedPool: Scalars['Boolean'];
  /** Id of the token. A combination of pool id and token address. */
  id: Scalars['ID'];
  /** Index of the pool token in the pool as returned by the vault. */
  index: Scalars['Int'];
  /** Whether the token is in the allow list. */
  isAllowed: Scalars['Boolean'];
  /**
   * If it is an ERC4626 token, this defines whether we allow it to use the buffer for pool operations.
   * @deprecated Use useUnderlyingForAddRemove and useWrappedForAddRemove instead
   */
  isBufferAllowed: Scalars['Boolean'];
  /** Whether the token is considered an ERC4626 token. */
  isErc4626: Scalars['Boolean'];
  /** Whether the token is exempted from taking a protocol yield fee. */
  isExemptFromProtocolYieldFee: Scalars['Boolean'];
  /** Token logo */
  logoURI?: Maybe<Scalars['String']>;
  /** Name of the pool token. */
  name: Scalars['String'];
  /** Additional data for the nested pool if the token is a BPT. Null otherwise. */
  nestedPool?: Maybe<GqlNestedPool>;
  /** If it is an appreciating token, it shows the current price rate. 1 otherwise. */
  priceRate: Scalars['BigDecimal'];
  /** The address of the price rate provider. */
  priceRateProvider?: Maybe<Scalars['String']>;
  /** Additional data for the price rate provider, such as reviews or warnings. */
  priceRateProviderData?: Maybe<GqlPriceRateProviderData>;
  /**
   * The priority of the token, can be used for sorting.
   * @deprecated Unused
   */
  priority?: Maybe<Scalars['Int']>;
  /** Conversion factor used to adjust for token decimals for uniform precision in calculations. V3 only. */
  scalingFactor?: Maybe<Scalars['BigDecimal']>;
  /** Symbol of the pool token. */
  symbol: Scalars['String'];
  /**
   * Is the token tradable
   * @deprecated Unused
   */
  tradable?: Maybe<Scalars['Boolean']>;
  /** If it is an ERC4626, this will be the underlying token if present in the API. */
  underlyingToken?: Maybe<GqlToken>;
  /** If it is an ERC4626 token, this defines whether we allow underlying tokens to be used for add/remove operations. */
  useUnderlyingForAddRemove?: Maybe<Scalars['Boolean']>;
  /** If it is an ERC4626 token, this defines whether we allow the wrapped tokens to be used for add/remove operations. */
  useWrappedForAddRemove?: Maybe<Scalars['Boolean']>;
  /** The weight of the token in the pool if it is a weighted pool, null otherwise */
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
  isErc4626: Scalars['Boolean'];
  isMainToken: Scalars['Boolean'];
  isNested: Scalars['Boolean'];
  isPhantomBpt: Scalars['Boolean'];
  name: Scalars['String'];
  symbol: Scalars['String'];
  weight?: Maybe<Scalars['String']>;
};

export type GqlPoolTokenUnion = GqlPoolToken | GqlPoolTokenComposableStable;

/** Supported pool types */
export enum GqlPoolType {
  ComposableStable = 'COMPOSABLE_STABLE',
  CowAmm = 'COW_AMM',
  Element = 'ELEMENT',
  Fx = 'FX',
  Gyro = 'GYRO',
  Gyro3 = 'GYRO3',
  Gyroe = 'GYROE',
  Investment = 'INVESTMENT',
  LiquidityBootstrapping = 'LIQUIDITY_BOOTSTRAPPING',
  MetaStable = 'META_STABLE',
  PhantomStable = 'PHANTOM_STABLE',
  Stable = 'STABLE',
  Unknown = 'UNKNOWN',
  Weighted = 'WEIGHTED',
}

export type GqlPoolUnion =
  | GqlPoolComposableStable
  | GqlPoolElement
  | GqlPoolFx
  | GqlPoolGyro
  | GqlPoolLiquidityBootstrapping
  | GqlPoolMetaStable
  | GqlPoolStable
  | GqlPoolWeighted;

/** If a user address was provided in the query, the user balance is populated here */
export type GqlPoolUserBalance = {
  __typename?: 'GqlPoolUserBalance';
  /** The staked BPT balances of the user. */
  stakedBalances: Array<GqlUserStakedBalance>;
  /** Total balance (wallet + staked) as float */
  totalBalance: Scalars['AmountHumanReadable'];
  /** Total balance (wallet + staked) in USD as float */
  totalBalanceUsd: Scalars['Float'];
  /** The wallet balance (BPT in wallet) as float. */
  walletBalance: Scalars['AmountHumanReadable'];
  /** The wallet balance (BPT in wallet) in USD as float. */
  walletBalanceUsd: Scalars['Float'];
};

export type GqlPoolUserSwapVolume = {
  __typename?: 'GqlPoolUserSwapVolume';
  swapVolumeUSD: Scalars['BigDecimal'];
  userAddress: Scalars['String'];
};

export type GqlPoolWeighted = GqlPoolBase & {
  __typename?: 'GqlPoolWeighted';
  address: Scalars['Bytes'];
  /** @deprecated Use poolTokens instead */
  allTokens: Array<GqlPoolTokenExpanded>;
  categories?: Maybe<Array<Maybe<GqlPoolFilterCategory>>>;
  chain: GqlChain;
  createTime: Scalars['Int'];
  decimals: Scalars['Int'];
  /** @deprecated Use poolTokens instead */
  displayTokens: Array<GqlPoolTokenDisplay>;
  dynamicData: GqlPoolDynamicData;
  factory?: Maybe<Scalars['Bytes']>;
  hasAnyAllowedBuffer: Scalars['Boolean'];
  hasErc4626: Scalars['Boolean'];
  hasNestedErc4626: Scalars['Boolean'];
  hook?: Maybe<GqlHook>;
  id: Scalars['ID'];
  /** @deprecated Removed without replacement */
  investConfig: GqlPoolInvestConfig;
  liquidityManagement?: Maybe<LiquidityManagement>;
  name: Scalars['String'];
  /** @deprecated Removed without replacement */
  nestingType: GqlPoolNestingType;
  /**
   * The wallet address of the owner of the pool. Pool owners can set certain properties like swapFees or AMP.
   * @deprecated Use swapFeeManager instead
   */
  owner?: Maybe<Scalars['Bytes']>;
  /** Account empowered to pause/unpause the pool (or 0 to delegate to governance) */
  pauseManager?: Maybe<Scalars['Bytes']>;
  /** Account empowered to set the pool creator fee percentage */
  poolCreator?: Maybe<Scalars['Bytes']>;
  poolTokens: Array<GqlPoolTokenDetail>;
  protocolVersion: Scalars['Int'];
  staking?: Maybe<GqlPoolStaking>;
  /** Account empowered to set static swap fees for a pool (when 0 on V2 swap fees are immutable, on V3 delegate to governance) */
  swapFeeManager?: Maybe<Scalars['Bytes']>;
  symbol: Scalars['String'];
  tags?: Maybe<Array<Maybe<Scalars['String']>>>;
  /**
   * All tokens of the pool. If it is a nested pool, the nested pool is expanded with its own tokens again.
   * @deprecated Use poolTokens instead
   */
  tokens: Array<GqlPoolTokenUnion>;
  type: GqlPoolType;
  userBalance?: Maybe<GqlPoolUserBalance>;
  /** @deprecated use protocolVersion instead */
  vaultVersion: Scalars['Int'];
  version: Scalars['Int'];
  /** @deprecated Removed without replacement */
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

/** Returns the price impact of the path. If there is an error in the price impact calculation, priceImpact will be undefined but the error string is populated. */
export type GqlPriceImpact = {
  __typename?: 'GqlPriceImpact';
  /** If priceImpact cant be calculated and is returned as undefined, the error string will be populated. */
  error?: Maybe<Scalars['String']>;
  /** Price impact in percent 0.01 -> 0.01%; undefined if an error happened. */
  priceImpact?: Maybe<Scalars['AmountHumanReadable']>;
};

/** Represents the data of a price rate provider */
export type GqlPriceRateProviderData = {
  __typename?: 'GqlPriceRateProviderData';
  /** The address of the price rate provider */
  address: Scalars['String'];
  /** The factory used to create the price rate provider, if applicable */
  factory?: Maybe<Scalars['String']>;
  /** The name of the price rate provider */
  name?: Maybe<Scalars['String']>;
  /** The filename of the review of the price rate provider */
  reviewFile?: Maybe<Scalars['String']>;
  /** Indicates if the price rate provider has been reviewed */
  reviewed: Scalars['Boolean'];
  /** A summary of the price rate provider, usually just says safe or unsafe */
  summary?: Maybe<Scalars['String']>;
  /** Upgradeable components of the price rate provider */
  upgradeableComponents?: Maybe<
    Array<Maybe<GqlPriceRateProviderUpgradeableComponent>>
  >;
  /** Warnings associated with the price rate provider */
  warnings?: Maybe<Array<Scalars['String']>>;
};

/** Represents an upgradeable component of a price rate provider */
export type GqlPriceRateProviderUpgradeableComponent = {
  __typename?: 'GqlPriceRateProviderUpgradeableComponent';
  /** The entry point / proxy of the upgradeable component */
  entryPoint: Scalars['String'];
  /** Indicates if the implementation of the component has been reviewed */
  implementationReviewed: Scalars['String'];
};

export type GqlProtocolMetricsAggregated = {
  __typename?: 'GqlProtocolMetricsAggregated';
  chains: Array<GqlProtocolMetricsChain>;
  numLiquidityProviders: Scalars['BigInt'];
  poolCount: Scalars['BigInt'];
  swapFee24h: Scalars['BigDecimal'];
  swapVolume24h: Scalars['BigDecimal'];
  totalLiquidity: Scalars['BigDecimal'];
  /** @deprecated No replacement */
  totalSwapFee: Scalars['BigDecimal'];
  /** @deprecated No replacement */
  totalSwapVolume: Scalars['BigDecimal'];
  yieldCapture24h: Scalars['BigDecimal'];
};

export type GqlProtocolMetricsChain = {
  __typename?: 'GqlProtocolMetricsChain';
  chainId: Scalars['String'];
  numLiquidityProviders: Scalars['BigInt'];
  poolCount: Scalars['BigInt'];
  swapFee24h: Scalars['BigDecimal'];
  swapVolume24h: Scalars['BigDecimal'];
  totalLiquidity: Scalars['BigDecimal'];
  /** @deprecated No replacement */
  totalSwapFee: Scalars['BigDecimal'];
  /** @deprecated No replacement */
  totalSwapVolume: Scalars['BigDecimal'];
  yieldCapture24h: Scalars['BigDecimal'];
};

export type GqlRelicSnapshot = {
  __typename?: 'GqlRelicSnapshot';
  balance: Scalars['String'];
  entryTimestamp: Scalars['Int'];
  farmId: Scalars['String'];
  level: Scalars['Int'];
  relicId: Scalars['Int'];
};

export type GqlReliquaryFarmLevelSnapshot = {
  __typename?: 'GqlReliquaryFarmLevelSnapshot';
  balance: Scalars['String'];
  id: Scalars['ID'];
  level: Scalars['String'];
};

export type GqlReliquaryFarmSnapshot = {
  __typename?: 'GqlReliquaryFarmSnapshot';
  dailyDeposited: Scalars['String'];
  dailyWithdrawn: Scalars['String'];
  farmId: Scalars['String'];
  id: Scalars['ID'];
  levelBalances: Array<GqlReliquaryFarmLevelSnapshot>;
  relicCount: Scalars['String'];
  timestamp: Scalars['Int'];
  tokenBalances: Array<GqlReliquaryTokenBalanceSnapshot>;
  totalBalance: Scalars['String'];
  totalLiquidity: Scalars['String'];
  userCount: Scalars['String'];
};

export type GqlReliquaryTokenBalanceSnapshot = {
  __typename?: 'GqlReliquaryTokenBalanceSnapshot';
  address: Scalars['String'];
  balance: Scalars['String'];
  decimals: Scalars['Int'];
  id: Scalars['ID'];
  name: Scalars['String'];
  symbol: Scalars['String'];
};

export type GqlSftmxStakingData = {
  __typename?: 'GqlSftmxStakingData';
  /** Current exchange rate for sFTMx -> FTM */
  exchangeRate: Scalars['String'];
  /** Whether maintenance is paused. This pauses reward claiming or harvesting and withdrawing from matured vaults. */
  maintenancePaused: Scalars['Boolean'];
  /** The maximum FTM amount to depost. */
  maxDepositLimit: Scalars['AmountHumanReadable'];
  /** The minimum FTM amount to deposit. */
  minDepositLimit: Scalars['AmountHumanReadable'];
  /** Number of vaults that delegated to validators. */
  numberOfVaults: Scalars['Int'];
  /** The current rebasing APR for sFTMx. */
  stakingApr: Scalars['String'];
  /** Total amount of FTM in custody of sFTMx. Staked FTM plus free pool FTM. */
  totalFtmAmount: Scalars['AmountHumanReadable'];
  /** Total amount of FTM in the free pool. */
  totalFtmAmountInPool: Scalars['AmountHumanReadable'];
  /** Total amount of FTM staked/delegated to validators. */
  totalFtmAmountStaked: Scalars['AmountHumanReadable'];
  /** Whether undelegation is paused. Undelegate is the first step to redeem sFTMx. */
  undelegatePaused: Scalars['Boolean'];
  /** A list of all the vaults that delegated to validators. */
  vaults: Array<GqlSftmxStakingVault>;
  /** Whether withdrawals are paused. Withdraw is the second and final step to redeem sFTMx. */
  withdrawPaused: Scalars['Boolean'];
  /** Delay to wait between undelegate (1st step) and withdraw (2nd step). */
  withdrawalDelay: Scalars['Int'];
};

export type GqlSftmxStakingSnapshot = {
  __typename?: 'GqlSftmxStakingSnapshot';
  /** Current exchange rate for sFTMx -> FTM */
  exchangeRate: Scalars['String'];
  id: Scalars['ID'];
  /** The timestamp of the snapshot. Timestamp is end of day midnight. */
  timestamp: Scalars['Int'];
  /** Total amount of FTM in custody of sFTMx. Staked FTM plus free pool FTM. */
  totalFtmAmount: Scalars['AmountHumanReadable'];
  /** Total amount of FTM in the free pool. */
  totalFtmAmountInPool: Scalars['AmountHumanReadable'];
  /** Total amount of FTM staked/delegated to validators. */
  totalFtmAmountStaked: Scalars['AmountHumanReadable'];
};

export enum GqlSftmxStakingSnapshotDataRange {
  AllTime = 'ALL_TIME',
  NinetyDays = 'NINETY_DAYS',
  OneHundredEightyDays = 'ONE_HUNDRED_EIGHTY_DAYS',
  OneYear = 'ONE_YEAR',
  ThirtyDays = 'THIRTY_DAYS',
}

export type GqlSftmxStakingVault = {
  __typename?: 'GqlSftmxStakingVault';
  /** The amount of FTM that has been delegated via this vault. */
  ftmAmountStaked: Scalars['AmountHumanReadable'];
  /** Whether the vault is matured, meaning whether unlock time has passed. */
  isMatured: Scalars['Boolean'];
  /** Timestamp when the delegated FTM unlocks, matures. */
  unlockTimestamp: Scalars['Int'];
  /** The address of the validator that the vault has delegated to. */
  validatorAddress: Scalars['String'];
  /** The ID of the validator that the vault has delegated to. */
  validatorId: Scalars['String'];
  /** The contract address of the vault. */
  vaultAddress: Scalars['String'];
  /** The internal index of the vault. */
  vaultIndex: Scalars['Int'];
};

export type GqlSftmxWithdrawalRequests = {
  __typename?: 'GqlSftmxWithdrawalRequests';
  /** Amount of sFTMx that is being redeemed. */
  amountSftmx: Scalars['AmountHumanReadable'];
  /** The Withdrawal ID, used for interactions. */
  id: Scalars['String'];
  /** Whether the requests is finished and the user has withdrawn. */
  isWithdrawn: Scalars['Boolean'];
  /** The timestamp when the request was placed. There is a delay until the user can withdraw. See withdrawalDelay. */
  requestTimestamp: Scalars['Int'];
  /** The user address that this request belongs to. */
  user: Scalars['String'];
};

export type GqlSorCallData = {
  __typename?: 'GqlSorCallData';
  /** The call data that needs to be sent to the RPC */
  callData: Scalars['String'];
  /** Maximum amount to be sent for exact out orders */
  maxAmountInRaw?: Maybe<Scalars['String']>;
  /** Minimum amount received for exact in orders */
  minAmountOutRaw?: Maybe<Scalars['String']>;
  /** The target contract to send the call data to */
  to: Scalars['String'];
  /** Value in ETH that needs to be sent for native swaps */
  value: Scalars['BigDecimal'];
};

/** The swap paths for a swap */
export type GqlSorGetSwapPaths = {
  __typename?: 'GqlSorGetSwapPaths';
  /**
   * Transaction data that can be posted to an RPC to execute the swap.
   * @deprecated Use Balancer SDK to build swap callData from SOR response
   */
  callData?: Maybe<GqlSorCallData>;
  /** The price of tokenOut in tokenIn. */
  effectivePrice: Scalars['AmountHumanReadable'];
  /** The price of tokenIn in tokenOut. */
  effectivePriceReversed: Scalars['AmountHumanReadable'];
  /** The found paths as needed as input for the b-sdk to execute the swap */
  paths: Array<GqlSorPath>;
  /** Price impact of the path */
  priceImpact: GqlPriceImpact;
  /** The version of the protocol these paths are from */
  protocolVersion: Scalars['Int'];
  /** The return amount in human form. Return amount is either tokenOutAmount (if swapType is exactIn) or tokenInAmount (if swapType is exactOut) */
  returnAmount: Scalars['AmountHumanReadable'];
  /** The return amount in a raw form */
  returnAmountRaw: Scalars['BigDecimal'];
  /** The swap routes including pool information. Used to display by the UI */
  routes: Array<GqlSorSwapRoute>;
  /** The swap amount in human form. Swap amount is either tokenInAmount (if swapType is exactIn) or tokenOutAmount (if swapType is exactOut) */
  swapAmount: Scalars['AmountHumanReadable'];
  /** The swap amount in a raw form */
  swapAmountRaw: Scalars['BigDecimal'];
  /** The swapType that was provided, exact_in vs exact_out (givenIn vs givenOut) */
  swapType: GqlSorSwapType;
  /** Swaps as needed for the vault swap input to execute the swap */
  swaps: Array<GqlSorSwap>;
  /** All token addresses (or assets) as needed for the vault swap input to execute the swap */
  tokenAddresses: Array<Scalars['String']>;
  /** The token address of the tokenIn provided */
  tokenIn: Scalars['String'];
  /** The amount of tokenIn in human form */
  tokenInAmount: Scalars['AmountHumanReadable'];
  /** The token address of the tokenOut provided */
  tokenOut: Scalars['String'];
  /** The amount of tokenOut in human form */
  tokenOutAmount: Scalars['AmountHumanReadable'];
  /**
   * The version of the vault these paths are from
   * @deprecated Use protocolVersion instead
   */
  vaultVersion: Scalars['Int'];
};

/** A path of a swap. A swap can have multiple paths. Used as input to execute the swap via b-sdk */
export type GqlSorPath = {
  __typename?: 'GqlSorPath';
  /** Input amount of this path in scaled form */
  inputAmountRaw: Scalars['String'];
  /** A sorted list of booleans that indicate if the respective pool is a buffer */
  isBuffer: Array<Scalars['Boolean']>;
  /** Output amount of this path in scaled form */
  outputAmountRaw: Scalars['String'];
  /** A sorted list of pool ids that are used in this path */
  pools: Array<Scalars['String']>;
  /** The version of the protocol these paths are from */
  protocolVersion: Scalars['Int'];
  /** A sorted list of tokens that are ussed in this path */
  tokens: Array<Token>;
  /**
   * Vault version of this path.
   * @deprecated Use protocolVersion instead
   */
  vaultVersion: Scalars['Int'];
};

/** A single swap step as used for input to the vault to execute a swap */
export type GqlSorSwap = {
  __typename?: 'GqlSorSwap';
  /** Amount to be swapped in this step. 0 for chained swap. */
  amount: Scalars['String'];
  /** Index of the asset used in the tokenAddress array. */
  assetInIndex: Scalars['Int'];
  /** Index of the asset used in the tokenAddress array. */
  assetOutIndex: Scalars['Int'];
  /** Pool id used in this swap step */
  poolId: Scalars['String'];
  /** UserData used in this swap, generally uses defaults. */
  userData: Scalars['String'];
};

/** The swap routes including pool information. Used to display by the UI */
export type GqlSorSwapRoute = {
  __typename?: 'GqlSorSwapRoute';
  /** The hops this route takes */
  hops: Array<GqlSorSwapRouteHop>;
  /** Share of this route of the total swap */
  share: Scalars['Float'];
  /** Address of the tokenIn */
  tokenIn: Scalars['String'];
  /** Amount of the tokenIn in human form */
  tokenInAmount: Scalars['AmountHumanReadable'];
  /** Address of the tokenOut */
  tokenOut: Scalars['String'];
  /** Amount of the tokenOut in human form */
  tokenOutAmount: Scalars['AmountHumanReadable'];
};

/** A hop of a route. A route can have many hops meaning it traverses more than one pool. */
export type GqlSorSwapRouteHop = {
  __typename?: 'GqlSorSwapRouteHop';
  /** The pool entity of this hop. */
  pool: GqlPoolMinimal;
  /** The pool id of this hop. */
  poolId: Scalars['String'];
  /** Address of the tokenIn */
  tokenIn: Scalars['String'];
  /** Amount of the tokenIn in human form */
  tokenInAmount: Scalars['AmountHumanReadable'];
  /** Address of the tokenOut */
  tokenOut: Scalars['String'];
  /** Amount of the tokenOut in human form */
  tokenOutAmount: Scalars['AmountHumanReadable'];
};

export enum GqlSorSwapType {
  ExactIn = 'EXACT_IN',
  ExactOut = 'EXACT_OUT',
}

export type GqlStakedSonicData = {
  __typename?: 'GqlStakedSonicData';
  /** A list of all the delegated validators. */
  delegatedValidators: Array<GqlStakedSonicDelegatedValidator>;
  /** Current exchange rate for stS -> S */
  exchangeRate: Scalars['String'];
  /** The total protocol fee collected in the last 24 hours. */
  protocolFee24h: Scalars['String'];
  /** The total rewards claimed in the last 24 hours. */
  rewardsClaimed24h: Scalars['String'];
  /** The current rebasing APR for stS. */
  stakingApr: Scalars['String'];
  /** Total amount of S in custody of stS. Delegated S plus pool S. */
  totalAssets: Scalars['AmountHumanReadable'];
  /** Total amount of S elegated to validators. */
  totalAssetsDelegated: Scalars['AmountHumanReadable'];
  /** Total amount of S in the pool to be delegated. */
  totalAssetsPool: Scalars['AmountHumanReadable'];
};

export type GqlStakedSonicDelegatedValidator = {
  __typename?: 'GqlStakedSonicDelegatedValidator';
  /** The amount of S that has been delegated to this validator. */
  assetsDelegated: Scalars['AmountHumanReadable'];
  /** The id of the validator. */
  validatorId: Scalars['String'];
};

export type GqlStakedSonicSnapshot = {
  __typename?: 'GqlStakedSonicSnapshot';
  /** Current exchange rate for stS -> S */
  exchangeRate: Scalars['String'];
  id: Scalars['ID'];
  /** The total protocol fee collected during that day. */
  protocolFee24h: Scalars['String'];
  /** The total rewards claimed during that day. */
  rewardsClaimed24h: Scalars['String'];
  /** The timestamp of the snapshot. Timestamp is end of day midnight. */
  timestamp: Scalars['Int'];
  /** Total amount of S in custody of stS. Delegated S plus pool S. */
  totalAssets: Scalars['AmountHumanReadable'];
  /** Total amount of S delegated to validators. */
  totalAssetsDelegated: Scalars['AmountHumanReadable'];
  /** Total amount of S in the pool. */
  totalAssetsPool: Scalars['AmountHumanReadable'];
};

export enum GqlStakedSonicSnapshotDataRange {
  AllTime = 'ALL_TIME',
  NinetyDays = 'NINETY_DAYS',
  OneHundredEightyDays = 'ONE_HUNDRED_EIGHTY_DAYS',
  OneYear = 'ONE_YEAR',
  ThirtyDays = 'THIRTY_DAYS',
}

/** Inputs for the call data to create the swap transaction. If this input is given, call data is added to the response. */
export type GqlSwapCallDataInput = {
  /** How long the swap should be valid, provide a timestamp. "999999999999999999" for infinite. Default: infinite */
  deadline?: InputMaybe<Scalars['Int']>;
  /** Who receives the output amount. */
  receiver: Scalars['String'];
  /** Who sends the input amount. */
  sender: Scalars['String'];
  /** The max slippage in percent 0.01 -> 0.01% */
  slippagePercentage: Scalars['String'];
};

/** Represents a token in the system */
export type GqlToken = {
  __typename?: 'GqlToken';
  /** The address of the token */
  address: Scalars['String'];
  /** The chain of the token */
  chain: GqlChain;
  /** The chain ID of the token */
  chainId: Scalars['Int'];
  /** The coingecko ID for this token, if present */
  coingeckoId?: Maybe<Scalars['String']>;
  /** The number of decimal places for the token */
  decimals: Scalars['Int'];
  /** The description of the token */
  description?: Maybe<Scalars['String']>;
  /** The Discord URL of the token */
  discordUrl?: Maybe<Scalars['String']>;
  /** The ERC4626 review data for the token */
  erc4626ReviewData?: Maybe<Erc4626ReviewData>;
  /** If it is an ERC4626 token, this defines whether we allow it to use the buffer for pool operations. */
  isBufferAllowed: Scalars['Boolean'];
  /** Whether the token is considered an ERC4626 token. */
  isErc4626: Scalars['Boolean'];
  /** The logo URI of the token */
  logoURI?: Maybe<Scalars['String']>;
  /** The name of the token */
  name: Scalars['String'];
  /** The rate provider data for the token */
  priceRateProviderData?: Maybe<GqlPriceRateProviderData>;
  /** The priority of the token, can be used for sorting. */
  priority: Scalars['Int'];
  /**
   * The rate provider data for the token
   * @deprecated Use priceRateProviderData instead
   */
  rateProviderData?: Maybe<GqlPriceRateProviderData>;
  /** The symbol of the token */
  symbol: Scalars['String'];
  /** The Telegram URL of the token */
  telegramUrl?: Maybe<Scalars['String']>;
  /** Indicates if the token is tradable */
  tradable: Scalars['Boolean'];
  /** The Twitter username of the token */
  twitterUsername?: Maybe<Scalars['String']>;
  /** The ERC4626 underlying token address, if applicable. */
  underlyingTokenAddress?: Maybe<Scalars['String']>;
  /** The website URL of the token */
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
  All = 'ALL',
  NinetyDay = 'NINETY_DAY',
  OneHundredEightyDay = 'ONE_HUNDRED_EIGHTY_DAY',
  OneYear = 'ONE_YEAR',
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

/** Represents additional data for a token */
export type GqlTokenDynamicData = {
  __typename?: 'GqlTokenDynamicData';
  /** The all-time high price of the token */
  ath: Scalars['Float'];
  /** The all-time low price of the token */
  atl: Scalars['Float'];
  /** The fully diluted valuation of the token */
  fdv?: Maybe<Scalars['String']>;
  /** The highest price in the last 24 hours */
  high24h: Scalars['Float'];
  /** The unique identifier of the dynamic data */
  id: Scalars['String'];
  /** The lowest price in the last 24 hours */
  low24h: Scalars['Float'];
  /** The market capitalization of the token */
  marketCap?: Maybe<Scalars['String']>;
  /** The current price of the token */
  price: Scalars['Float'];
  /** The price change in the last 24 hours */
  priceChange24h: Scalars['Float'];
  /** The percentage price change in the last 7 days */
  priceChangePercent7d?: Maybe<Scalars['Float']>;
  /** The percentage price change in the last 14 days */
  priceChangePercent14d?: Maybe<Scalars['Float']>;
  /** The percentage price change in the last 24 hours */
  priceChangePercent24h: Scalars['Float'];
  /** The percentage price change in the last 30 days */
  priceChangePercent30d?: Maybe<Scalars['Float']>;
  /** The address of the token */
  tokenAddress: Scalars['String'];
  /** The timestamp when the data was last updated */
  updatedAt: Scalars['String'];
};

/** Provide filters for tokens */
export type GqlTokenFilter = {
  /** Only return tokens with these addresses */
  tokensIn?: InputMaybe<Array<Scalars['String']>>;
};

/** Result of the poolReloadPools mutation */
export type GqlTokenMutationResult = {
  __typename?: 'GqlTokenMutationResult';
  /** The chain that was reloaded. */
  chain: GqlChain;
  /** The error message */
  error?: Maybe<Scalars['String']>;
  /** Whether it was successful or not. */
  success: Scalars['Boolean'];
};

export type GqlTokenPrice = {
  __typename?: 'GqlTokenPrice';
  address: Scalars['String'];
  chain: GqlChain;
  price: Scalars['Float'];
  updatedAt: Scalars['Int'];
  updatedBy?: Maybe<Scalars['String']>;
};

export type GqlTokenPriceChartDataItem = {
  __typename?: 'GqlTokenPriceChartDataItem';
  id: Scalars['ID'];
  price: Scalars['AmountHumanReadable'];
  timestamp: Scalars['Int'];
};

export enum GqlTokenType {
  Bpt = 'BPT',
  PhantomBpt = 'PHANTOM_BPT',
  WhiteListed = 'WHITE_LISTED',
}

export type GqlUserFbeetsBalance = {
  __typename?: 'GqlUserFbeetsBalance';
  id: Scalars['String'];
  stakedBalance: Scalars['AmountHumanReadable'];
  totalBalance: Scalars['AmountHumanReadable'];
  walletBalance: Scalars['AmountHumanReadable'];
};

export type GqlUserPoolBalance = {
  __typename?: 'GqlUserPoolBalance';
  chain: GqlChain;
  poolId: Scalars['String'];
  stakedBalance: Scalars['AmountHumanReadable'];
  tokenAddress: Scalars['String'];
  tokenPrice: Scalars['Float'];
  totalBalance: Scalars['AmountHumanReadable'];
  walletBalance: Scalars['AmountHumanReadable'];
};

export type GqlUserStakedBalance = {
  __typename?: 'GqlUserStakedBalance';
  /** The staked BPT balance as float. */
  balance: Scalars['AmountHumanReadable'];
  /** The steaked BPT balance in USD as float. */
  balanceUsd: Scalars['Float'];
  /** The id of the staking to match with GqlPoolStaking.id. */
  stakingId: Scalars['String'];
  /** The staking type (Gauge, farm, aura, etc.) in which this balance is staked. */
  stakingType: GqlPoolStakingType;
};

export type GqlUserSwapVolumeFilter = {
  poolIdIn?: InputMaybe<Array<Scalars['String']>>;
  tokenInIn?: InputMaybe<Array<Scalars['String']>>;
  tokenOutIn?: InputMaybe<Array<Scalars['String']>>;
};

export type GqlVeBalBalance = {
  __typename?: 'GqlVeBalBalance';
  balance: Scalars['AmountHumanReadable'];
  chain: GqlChain;
  locked: Scalars['AmountHumanReadable'];
  lockedUsd: Scalars['AmountHumanReadable'];
};

/** Represents a snapshot of a VeBal lock at a specific point in time. */
export type GqlVeBalLockSnapshot = {
  __typename?: 'GqlVeBalLockSnapshot';
  /** The locked balance at that time. */
  balance: Scalars['AmountHumanReadable'];
  bias: Scalars['String'];
  slope: Scalars['String'];
  /** The timestamp of the snapshot, snapshots are taking at lock events. */
  timestamp: Scalars['Int'];
};

export type GqlVeBalUserData = {
  __typename?: 'GqlVeBalUserData';
  balance: Scalars['AmountHumanReadable'];
  lockSnapshots: Array<GqlVeBalLockSnapshot>;
  locked: Scalars['AmountHumanReadable'];
  lockedUsd: Scalars['AmountHumanReadable'];
  rank?: Maybe<Scalars['Int']>;
};

/** The Gauge that can be voted on through veBAL and that will ultimately receive the rewards. */
export type GqlVotingGauge = {
  __typename?: 'GqlVotingGauge';
  /** The timestamp the gauge was added. */
  addedTimestamp?: Maybe<Scalars['Int']>;
  /** The address of the root gauge on Ethereum mainnet. */
  address: Scalars['Bytes'];
  /** The address of the child gauge on the specific chain. */
  childGaugeAddress?: Maybe<Scalars['Bytes']>;
  /** Whether the gauge is killed or not. */
  isKilled: Scalars['Boolean'];
  /** The relative weight the gauge received this epoch (not more than 1.0). */
  relativeWeight: Scalars['String'];
  /** The relative weight cap. 1.0 for uncapped. */
  relativeWeightCap?: Maybe<Scalars['String']>;
};

/** A token inside of a pool with a voting gauge. */
export type GqlVotingGaugeToken = {
  __typename?: 'GqlVotingGaugeToken';
  /** The address of the token. */
  address: Scalars['String'];
  /** The URL to the token logo. */
  logoURI: Scalars['String'];
  /** The symbol of the token. */
  symbol: Scalars['String'];
  /** If it is a weighted pool, the weigh of the token is shown here in %. 0.5 = 50%. */
  weight?: Maybe<Scalars['String']>;
};

/** The pool that can be voted on through veBAL */
export type GqlVotingPool = {
  __typename?: 'GqlVotingPool';
  /** The address of the pool. */
  address: Scalars['Bytes'];
  /** The chain this pool is on. */
  chain: GqlChain;
  /** The gauge that is connected to the pool and that will receive the rewards. */
  gauge: GqlVotingGauge;
  /** Pool ID */
  id: Scalars['ID'];
  /** The symbol of the pool. */
  symbol: Scalars['String'];
  /** The tokens inside the pool. */
  tokens: Array<GqlVotingGaugeToken>;
  /** The type of the pool. */
  type: GqlPoolType;
};

export type HookConfig = {
  __typename?: 'HookConfig';
  /** True when hook can change the amounts send to the vault. Necessary to deduct the fees. */
  enableHookAdjustedAmounts: Scalars['Boolean'];
  shouldCallAfterAddLiquidity: Scalars['Boolean'];
  shouldCallAfterInitialize: Scalars['Boolean'];
  shouldCallAfterRemoveLiquidity: Scalars['Boolean'];
  shouldCallAfterSwap: Scalars['Boolean'];
  shouldCallBeforeAddLiquidity: Scalars['Boolean'];
  shouldCallBeforeInitialize: Scalars['Boolean'];
  shouldCallBeforeRemoveLiquidity: Scalars['Boolean'];
  shouldCallBeforeSwap: Scalars['Boolean'];
  shouldCallComputeDynamicSwapFee: Scalars['Boolean'];
};

export type HookParams =
  | ExitFeeHookParams
  | FeeTakingHookParams
  | MevTaxHookParams
  | StableSurgeHookParams;

/** Liquidity management settings for v3 pools. */
export type LiquidityManagement = {
  __typename?: 'LiquidityManagement';
  /** Indicates whether this pool has disabled add and removes of unbalanced/non-proportional liquidity. Meaning it will only support proportional add and remove liquidity. */
  disableUnbalancedLiquidity?: Maybe<Scalars['Boolean']>;
  /** Whether this pool support additional, custom add liquditiy operations apart from proportional, unbalanced and single asset. */
  enableAddLiquidityCustom?: Maybe<Scalars['Boolean']>;
  /** Indicates whether donation is enabled. Meaning you can send funds to the pool without receiving a BPT. */
  enableDonation?: Maybe<Scalars['Boolean']>;
  /** Whether this pool support additional, custom remove liquditiy operations apart from proportional, unbalanced and single asset. */
  enableRemoveLiquidityCustom?: Maybe<Scalars['Boolean']>;
};

/** MevTax hook specific params. Percentage format is 0.01 -> 0.01%. */
export type MevTaxHookParams = {
  __typename?: 'MevTaxHookParams';
  maxMevSwapFeePercentage?: Maybe<Scalars['String']>;
  mevTaxMultiplier?: Maybe<Scalars['String']>;
  mevTaxThreshold?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  beetsPoolLoadReliquarySnapshotsForAllFarms: Scalars['String'];
  beetsSyncFbeetsRatio: Scalars['String'];
  poolLoadOnChainDataForAllPools: Array<GqlPoolMutationResult>;
  poolLoadSnapshotsForPools: Scalars['String'];
  poolReloadAllPoolAprs: Scalars['String'];
  poolReloadPools: Array<GqlPoolMutationResult>;
  poolReloadStakingForAllPools: Scalars['String'];
  poolSyncAllCowSnapshots: Array<GqlPoolMutationResult>;
  poolSyncAllPoolsFromSubgraph: Array<Scalars['String']>;
  poolSyncFxQuoteTokens: Array<GqlPoolMutationResult>;
  poolUpdateLifetimeValuesForAllPools: Scalars['String'];
  poolUpdateLiquidityValuesForAllPools: Scalars['String'];
  protocolCacheMetrics: Scalars['String'];
  sftmxSyncStakingData: Scalars['String'];
  sftmxSyncWithdrawalRequests: Scalars['String'];
  tokenDeleteTokenType: Scalars['String'];
  tokenReloadAllTokenTypes: Scalars['String'];
  tokenReloadErc4626Tokens: Array<GqlTokenMutationResult>;
  tokenReloadTokenPrices?: Maybe<Scalars['Boolean']>;
  tokenSyncLatestFxPrices: Scalars['String'];
  tokenSyncTokenDefinitions: Scalars['String'];
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

export type MutationPoolLoadOnChainDataForAllPoolsArgs = {
  chains: Array<GqlChain>;
};

export type MutationPoolLoadSnapshotsForPoolsArgs = {
  poolIds: Array<Scalars['String']>;
  reload?: InputMaybe<Scalars['Boolean']>;
};

export type MutationPoolReloadAllPoolAprsArgs = {
  chain: GqlChain;
};

export type MutationPoolReloadPoolsArgs = {
  chains: Array<GqlChain>;
};

export type MutationPoolReloadStakingForAllPoolsArgs = {
  stakingTypes: Array<GqlPoolStakingType>;
};

export type MutationPoolSyncAllCowSnapshotsArgs = {
  chains: Array<GqlChain>;
};

export type MutationPoolSyncFxQuoteTokensArgs = {
  chains: Array<GqlChain>;
};

export type MutationTokenDeleteTokenTypeArgs = {
  tokenAddress: Scalars['String'];
  type: GqlTokenType;
};

export type MutationTokenReloadErc4626TokensArgs = {
  chains: Array<GqlChain>;
};

export type MutationTokenReloadTokenPricesArgs = {
  chains: Array<GqlChain>;
};

export type MutationTokenSyncLatestFxPricesArgs = {
  chain: GqlChain;
};

export type MutationUserInitStakedBalancesArgs = {
  stakingTypes: Array<GqlPoolStakingType>;
};

export type MutationUserInitWalletBalancesForAllPoolsArgs = {
  chain?: InputMaybe<GqlChain>;
};

export type MutationUserInitWalletBalancesForPoolArgs = {
  poolId: Scalars['String'];
};

export type MutationUserSyncBalanceArgs = {
  poolId: Scalars['String'];
};

export type PoolForBatchSwap = {
  __typename?: 'PoolForBatchSwap';
  allTokens?: Maybe<Array<TokenForBatchSwapPool>>;
  id: Scalars['String'];
  name: Scalars['String'];
  symbol: Scalars['String'];
  type: GqlPoolType;
};

export type Query = {
  __typename?: 'Query';
  /** Returns all pools for a given filter, specific for aggregators */
  aggregatorPools: Array<GqlPoolAggregator>;
  beetsGetFbeetsRatio: Scalars['String'];
  beetsPoolGetReliquaryFarmSnapshots: Array<GqlReliquaryFarmSnapshot>;
  /** @deprecated No longer supported */
  blocksGetAverageBlockTime: Scalars['Float'];
  /** @deprecated No longer supported */
  blocksGetBlocksPerDay: Scalars['Float'];
  /** @deprecated No longer supported */
  blocksGetBlocksPerSecond: Scalars['Float'];
  /** @deprecated No longer supported */
  blocksGetBlocksPerYear: Scalars['Float'];
  contentGetNewsItems: Array<GqlContentNewsItem>;
  latestSyncedBlocks: GqlLatestSyncedBlocks;
  /** Getting swap, add and remove events with paging */
  poolEvents: Array<GqlPoolEvent>;
  /**
   * Returns all pools for a given filter, specific for aggregators
   * @deprecated Use aggregatorPools instead
   */
  poolGetAggregatorPools: Array<GqlPoolAggregator>;
  /**
   * Will de deprecated in favor of poolEvents
   * @deprecated Use poolEvents instead
   */
  poolGetBatchSwaps: Array<GqlPoolBatchSwap>;
  /** Getting swap, add and remove events with range */
  poolGetEvents: Array<GqlPoolEvent>;
  /**
   * Will de deprecated in favor of poolGetFeaturedPools
   * @deprecated Use poolGetFeaturedPools instead
   */
  poolGetFeaturedPoolGroups: Array<GqlPoolFeaturedPoolGroup>;
  /** Returns the list of featured pools for chains */
  poolGetFeaturedPools: Array<GqlPoolFeaturedPool>;
  /**
   * Will de deprecated in favor of poolEvents
   * @deprecated Use poolEvents instead
   */
  poolGetJoinExits: Array<GqlPoolJoinExit>;
  /** Returns one pool. If a user address is provided, the user balances for the given pool will also be returned. */
  poolGetPool: GqlPoolBase;
  /** Returns all pools for a given filter */
  poolGetPools: Array<GqlPoolMinimal>;
  /** Returns the number of pools for a given filter. */
  poolGetPoolsCount: Scalars['Int'];
  /** Gets all the snapshots for a given pool on a chain for a certain range */
  poolGetSnapshots: Array<GqlPoolSnapshot>;
  /**
   * Will de deprecated in favor of poolEvents
   * @deprecated Use poolEvents instead
   */
  poolGetSwaps: Array<GqlPoolSwap>;
  protocolMetricsAggregated: GqlProtocolMetricsAggregated;
  protocolMetricsChain: GqlProtocolMetricsChain;
  /** Get the staking data and status for sFTMx */
  sftmxGetStakingData: GqlSftmxStakingData;
  /** Get snapshots for sftmx staking for a specific range */
  sftmxGetStakingSnapshots: Array<GqlSftmxStakingSnapshot>;
  /** Retrieve the withdrawalrequests from a user */
  sftmxGetWithdrawalRequests: Array<GqlSftmxWithdrawalRequests>;
  /** Get swap quote from the SOR v2 for the V2 vault */
  sorGetSwapPaths: GqlSorGetSwapPaths;
  /** Get the staking data and status for stS */
  stsGetGqlStakedSonicData: GqlStakedSonicData;
  /** Get snapshots for sftmx staking for a specific range */
  stsGetStakedSonicSnapshots: Array<GqlStakedSonicSnapshot>;
  /**
   * Returns the candlestick chart data for a token for a given range.
   * @deprecated Use tokenGetHistoricalPrices instead
   */
  tokenGetCandlestickChartData: Array<GqlTokenCandlestickChartDataItem>;
  /** Returns all current prices for allowed tokens for a given chain or chains */
  tokenGetCurrentPrices: Array<GqlTokenPrice>;
  /** Returns the historical prices for a given set of tokens for a given chain and range */
  tokenGetHistoricalPrices: Array<GqlHistoricalTokenPrice>;
  /**
   * DEPRECATED: Returns pricing data for a given token for a given range
   * @deprecated Use tokenGetHistoricalPrices instead
   */
  tokenGetPriceChartData: Array<GqlTokenPriceChartDataItem>;
  /**
   * Returns the price of either BAL or BEETS depending on chain
   * @deprecated Use tokenGetTokensDynamicData instead
   */
  tokenGetProtocolTokenPrice: Scalars['AmountHumanReadable'];
  /** Returns the price of a token priced in another token for a given range. */
  tokenGetRelativePriceChartData: Array<GqlTokenPriceChartDataItem>;
  /**
   * Returns meta data for a given token such as description, website, etc.
   * @deprecated Use tokenGetTokens instead
   */
  tokenGetTokenData?: Maybe<GqlTokenData>;
  /** Returns dynamic data of a token such as price, market cap, etc. */
  tokenGetTokenDynamicData?: Maybe<GqlTokenDynamicData>;
  /** Returns all allowed tokens for a given chain or chains */
  tokenGetTokens: Array<GqlToken>;
  /**
   * Returns meta data for a given set of tokens such as description, website, etc.
   * @deprecated Use tokenGetTokens instead
   */
  tokenGetTokensData: Array<GqlTokenData>;
  /** Returns dynamic data of a set of tokens such as price, market cap, etc. */
  tokenGetTokensDynamicData: Array<GqlTokenDynamicData>;
  userGetFbeetsBalance: GqlUserFbeetsBalance;
  userGetPoolBalances: Array<GqlUserPoolBalance>;
  /** Will de deprecated in favor of poolGetEvents */
  userGetPoolJoinExits: Array<GqlPoolJoinExit>;
  userGetStaking: Array<GqlPoolStaking>;
  /** Will de deprecated in favor of poolGetEvents */
  userGetSwaps: Array<GqlPoolSwap>;
  veBalGetTotalSupply: Scalars['AmountHumanReadable'];
  veBalGetUser: GqlVeBalUserData;
  veBalGetUserBalance: Scalars['AmountHumanReadable'];
  veBalGetUserBalances: Array<GqlVeBalBalance>;
  /** Returns all pools with veBAL gauges that can be voted on. */
  veBalGetVotingList: Array<GqlVotingPool>;
};

export type QueryAggregatorPoolsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GqlPoolOrderBy>;
  orderDirection?: InputMaybe<GqlPoolOrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlAggregatorPoolFilter>;
};

export type QueryBeetsPoolGetReliquaryFarmSnapshotsArgs = {
  id: Scalars['String'];
  range: GqlPoolSnapshotDataRange;
};

export type QueryContentGetNewsItemsArgs = {
  chain?: InputMaybe<GqlChain>;
};

export type QueryPoolEventsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlPoolEventsFilter>;
};

export type QueryPoolGetAggregatorPoolsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GqlPoolOrderBy>;
  orderDirection?: InputMaybe<GqlPoolOrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlPoolFilter>;
};

export type QueryPoolGetBatchSwapsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlPoolSwapFilter>;
};

export type QueryPoolGetEventsArgs = {
  chain: GqlChain;
  poolId: Scalars['String'];
  range: GqlPoolEventsDataRange;
  typeIn: Array<GqlPoolEventType>;
  userAddress?: InputMaybe<Scalars['String']>;
};

export type QueryPoolGetFeaturedPoolGroupsArgs = {
  chains?: InputMaybe<Array<GqlChain>>;
};

export type QueryPoolGetFeaturedPoolsArgs = {
  chains: Array<GqlChain>;
};

export type QueryPoolGetJoinExitsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlPoolJoinExitFilter>;
};

export type QueryPoolGetPoolArgs = {
  chain?: InputMaybe<GqlChain>;
  id: Scalars['String'];
  userAddress?: InputMaybe<Scalars['String']>;
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
  chain?: InputMaybe<GqlChain>;
  id: Scalars['String'];
  range: GqlPoolSnapshotDataRange;
};

export type QueryPoolGetSwapsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GqlPoolSwapFilter>;
};

export type QueryProtocolMetricsAggregatedArgs = {
  chains?: InputMaybe<Array<GqlChain>>;
};

export type QueryProtocolMetricsChainArgs = {
  chain?: InputMaybe<GqlChain>;
};

export type QuerySftmxGetStakingSnapshotsArgs = {
  range: GqlSftmxStakingSnapshotDataRange;
};

export type QuerySftmxGetWithdrawalRequestsArgs = {
  user: Scalars['String'];
};

export type QuerySorGetSwapPathsArgs = {
  chain: GqlChain;
  considerPoolsWithHooks?: InputMaybe<Scalars['Boolean']>;
  poolIds?: InputMaybe<Array<Scalars['String']>>;
  swapAmount: Scalars['AmountHumanReadable'];
  swapType: GqlSorSwapType;
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
  useProtocolVersion?: InputMaybe<Scalars['Int']>;
};

export type QueryStsGetStakedSonicSnapshotsArgs = {
  range: GqlStakedSonicSnapshotDataRange;
};

export type QueryTokenGetCandlestickChartDataArgs = {
  address: Scalars['String'];
  chain?: InputMaybe<GqlChain>;
  range: GqlTokenChartDataRange;
};

export type QueryTokenGetCurrentPricesArgs = {
  chains?: InputMaybe<Array<GqlChain>>;
};

export type QueryTokenGetHistoricalPricesArgs = {
  addresses: Array<Scalars['String']>;
  chain: GqlChain;
  range: GqlTokenChartDataRange;
};

export type QueryTokenGetPriceChartDataArgs = {
  address: Scalars['String'];
  chain?: InputMaybe<GqlChain>;
  range: GqlTokenChartDataRange;
};

export type QueryTokenGetProtocolTokenPriceArgs = {
  chain?: InputMaybe<GqlChain>;
};

export type QueryTokenGetRelativePriceChartDataArgs = {
  chain?: InputMaybe<GqlChain>;
  range: GqlTokenChartDataRange;
  tokenIn: Scalars['String'];
  tokenOut: Scalars['String'];
};

export type QueryTokenGetTokenDataArgs = {
  address: Scalars['String'];
  chain?: InputMaybe<GqlChain>;
};

export type QueryTokenGetTokenDynamicDataArgs = {
  address: Scalars['String'];
  chain?: InputMaybe<GqlChain>;
};

export type QueryTokenGetTokensArgs = {
  chains?: InputMaybe<Array<GqlChain>>;
  where?: InputMaybe<GqlTokenFilter>;
};

export type QueryTokenGetTokensDataArgs = {
  addresses: Array<Scalars['String']>;
};

export type QueryTokenGetTokensDynamicDataArgs = {
  addresses: Array<Scalars['String']>;
  chain?: InputMaybe<GqlChain>;
};

export type QueryUserGetPoolBalancesArgs = {
  address?: InputMaybe<Scalars['String']>;
  chains?: InputMaybe<Array<GqlChain>>;
};

export type QueryUserGetPoolJoinExitsArgs = {
  address?: InputMaybe<Scalars['String']>;
  chain?: InputMaybe<GqlChain>;
  first?: InputMaybe<Scalars['Int']>;
  poolId: Scalars['String'];
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryUserGetStakingArgs = {
  address?: InputMaybe<Scalars['String']>;
  chains?: InputMaybe<Array<GqlChain>>;
};

export type QueryUserGetSwapsArgs = {
  address?: InputMaybe<Scalars['String']>;
  chain?: InputMaybe<GqlChain>;
  first?: InputMaybe<Scalars['Int']>;
  poolId: Scalars['String'];
  skip?: InputMaybe<Scalars['Int']>;
};

export type QueryVeBalGetTotalSupplyArgs = {
  chain?: InputMaybe<GqlChain>;
};

export type QueryVeBalGetUserArgs = {
  address: Scalars['String'];
  chain?: InputMaybe<GqlChain>;
};

export type QueryVeBalGetUserBalanceArgs = {
  address?: InputMaybe<Scalars['String']>;
  chain?: InputMaybe<GqlChain>;
};

export type QueryVeBalGetUserBalancesArgs = {
  address: Scalars['String'];
  chains?: InputMaybe<Array<GqlChain>>;
};

export type QueryVeBalGetVotingListArgs = {
  includeKilled?: InputMaybe<Scalars['Boolean']>;
};

/** StableSurge hook specific params. Percentage format is 0.01 -> 0.01%. */
export type StableSurgeHookParams = {
  __typename?: 'StableSurgeHookParams';
  maxSurgeFeePercentage?: Maybe<Scalars['String']>;
  surgeThresholdPercentage?: Maybe<Scalars['String']>;
};

export type Token = {
  __typename?: 'Token';
  address: Scalars['String'];
  decimals: Scalars['Int'];
};

export type TokenForBatchSwapPool = {
  __typename?: 'TokenForBatchSwapPool';
  address: Scalars['String'];
  isNested: Scalars['Boolean'];
  isPhantomBpt: Scalars['Boolean'];
  weight?: Maybe<Scalars['BigDecimal']>;
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

export type VeBalGetVotingListQueryVariables = Exact<{
  includeKilled?: InputMaybe<Scalars['Boolean']>;
}>;

export type VeBalGetVotingListQuery = {
  __typename?: 'Query';
  veBalGetVotingList: Array<{
    __typename?: 'GqlVotingPool';
    chain: GqlChain;
    id: string;
    address: string;
    symbol: string;
    type: GqlPoolType;
    gauge: {
      __typename?: 'GqlVotingGauge';
      address: string;
      isKilled: boolean;
      relativeWeightCap?: string | null;
      addedTimestamp?: number | null;
    };
    tokens: Array<{
      __typename?: 'GqlVotingGaugeToken';
      address: string;
      logoURI: string;
      symbol: string;
      weight?: string | null;
    }>;
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
export const VeBalGetVotingListDocument = gql`
  query VeBalGetVotingList($includeKilled: Boolean) {
    veBalGetVotingList(includeKilled: $includeKilled) {
      chain
      id
      address
      symbol
      type
      gauge {
        address
        isKilled
        relativeWeightCap
        addedTimestamp
      }
      tokens {
        address
        logoURI
        symbol
        weight
      }
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
    VeBalGetVotingList(
      variables?: VeBalGetVotingListQueryVariables,
      requestHeaders?: Dom.RequestInit['headers']
    ): Promise<VeBalGetVotingListQuery> {
      return withWrapper(
        wrappedRequestHeaders =>
          client.request<VeBalGetVotingListQuery>(
            VeBalGetVotingListDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'VeBalGetVotingList',
        'query'
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
