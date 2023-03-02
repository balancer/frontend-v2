import { BigNumberish, BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import {
  PoolDataService,
  SubgraphPoolBase,
  TokenPriceService,
  SwapInfo,
  SOR,
  WeightedPool,
  StablePool,
  LinearPool,
  MetaStablePool,
  PhantomStablePool,
  ComposableStablePool,
  SwapTypes,
  SwapV2,
} from '@balancer-labs/sor';

import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import {
  Provider,
  JsonRpcProvider,
  JsonRpcSigner,
  TransactionRequest,
} from '@ethersproject/providers';
import { Vault, BalancerHelpers, LidoRelayer } from '@balancer-labs/typechain';
import { Signer, TypedDataSigner } from '@ethersproject/abstract-signer';

declare enum StablePoolJoinKind {
  INIT = 0,
  EXACT_TOKENS_IN_FOR_BPT_OUT = 1,
  TOKEN_IN_FOR_EXACT_BPT_OUT = 2,
}
declare enum StablePhantomPoolJoinKind {
  INIT = 0,
  COLLECT_PROTOCOL_FEES = 1,
}
declare enum StablePoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT = 0,
  EXACT_BPT_IN_FOR_TOKENS_OUT = 1,
  BPT_IN_FOR_EXACT_TOKENS_OUT = 2,
}
declare class StablePoolEncoder {
  /**
   * Cannot be constructed.
   */
  private constructor();
  /**
   * Encodes the userData parameter for providing the initial liquidity to a StablePool
   * @param initialBalances - the amounts of tokens to send to the pool to form the initial balances
   */
  static joinInit: (amountsIn: BigNumberish[]) => string;
  /**
   * Encodes the userData parameter for collecting protocol fees for StablePhantomPool
   */
  static joinCollectProtocolFees: () => string;
  /**
   * Encodes the userData parameter for joining a StablePool with exact token inputs
   * @param amountsIn - the amounts each of token to deposit in the pool as liquidity
   * @param minimumBPT - the minimum acceptable BPT to receive in return for deposited tokens
   */
  static joinExactTokensInForBPTOut: (
    amountsIn: BigNumberish[],
    minimumBPT: BigNumberish
  ) => string;
  /**
   * Encodes the userData parameter for joining a StablePool with to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   * @param enterTokenIndex - the index of the token to be provided as liquidity
   */
  static joinTokenInForExactBPTOut: (
    bptAmountOut: BigNumberish,
    enterTokenIndex: number
  ) => string;
  /**
   * Encodes the userData parameter for exiting a StablePool by removing a single token in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   * @param enterTokenIndex - the index of the token to removed from the pool
   */
  static exitExactBPTInForOneTokenOut: (
    bptAmountIn: BigNumberish,
    exitTokenIndex: number
  ) => string;
  /**
   * Encodes the userData parameter for exiting a StablePool by removing tokens in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   */
  static exitExactBPTInForTokensOut: (bptAmountIn: BigNumberish) => string;
  /**
   * Encodes the userData parameter for exiting a StablePool by removing exact amounts of tokens
   * @param amountsOut - the amounts of each token to be withdrawn from the pool
   * @param maxBPTAmountIn - the minimum acceptable BPT to burn in return for withdrawn tokens
   */
  static exitBPTInForExactTokensOut: (
    amountsOut: BigNumberish[],
    maxBPTAmountIn: BigNumberish
  ) => string;
}

declare enum WeightedPoolJoinKind {
  INIT = 0,
  EXACT_TOKENS_IN_FOR_BPT_OUT = 1,
  TOKEN_IN_FOR_EXACT_BPT_OUT = 2,
  ALL_TOKENS_IN_FOR_EXACT_BPT_OUT = 3,
}
declare enum WeightedPoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT = 0,
  EXACT_BPT_IN_FOR_TOKENS_OUT = 1,
  BPT_IN_FOR_EXACT_TOKENS_OUT = 2,
  MANAGEMENT_FEE_TOKENS_OUT = 3,
}
declare class WeightedPoolEncoder {
  /**
   * Cannot be constructed.
   */
  private constructor();
  /**
   * Encodes the userData parameter for providing the initial liquidity to a WeightedPool
   * @param initialBalances - the amounts of tokens to send to the pool to form the initial balances
   */
  static joinInit: (amountsIn: BigNumberish[]) => string;
  /**
   * Encodes the userData parameter for joining a WeightedPool with exact token inputs
   * @param amountsIn - the amounts each of token to deposit in the pool as liquidity
   * @param minimumBPT - the minimum acceptable BPT to receive in return for deposited tokens
   */
  static joinExactTokensInForBPTOut: (
    amountsIn: BigNumberish[],
    minimumBPT: BigNumberish
  ) => string;
  /**
   * Encodes the userData parameter for joining a WeightedPool with a single token to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   * @param enterTokenIndex - the index of the token to be provided as liquidity
   */
  static joinTokenInForExactBPTOut: (
    bptAmountOut: BigNumberish,
    enterTokenIndex: number
  ) => string;
  /**
   * Encodes the userData parameter for joining a WeightedPool proportionally to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   */
  static joinAllTokensInForExactBPTOut: (bptAmountOut: BigNumberish) => string;
  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing a single token in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   * @param enterTokenIndex - the index of the token to removed from the pool
   */
  static exitExactBPTInForOneTokenOut: (
    bptAmountIn: BigNumberish,
    exitTokenIndex: number
  ) => string;
  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing tokens in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   */
  static exitExactBPTInForTokensOut: (bptAmountIn: BigNumberish) => string;
  /**
   * Encodes the userData parameter for exiting a WeightedPool by removing exact amounts of tokens
   * @param amountsOut - the amounts of each token to be withdrawn from the pool
   * @param maxBPTAmountIn - the minimum acceptable BPT to burn in return for withdrawn tokens
   */
  static exitBPTInForExactTokensOut: (
    amountsOut: BigNumberish[],
    maxBPTAmountIn: BigNumberish
  ) => string;
}
declare class ManagedPoolEncoder {
  /**
   * Cannot be constructed.
   */
  private constructor();
  /**
   * Encodes the userData parameter for exiting a ManagedPool for withdrawing management fees.
   * This can only be done by the pool owner.
   */
  static exitForManagementFees: () => string;
}

/**
 * Normalize an array of token weights to ensure they sum to `1e18`
 * @param weights - an array of token weights to be normalized
 * @returns an equivalent set of normalized weights
 */
declare function toNormalizedWeights(weights: BigNumber[]): BigNumber[];
/**
 * Check whether a set of weights are normalized
 * @param weights - an array of potentially unnormalized weights
 * @returns a boolean of whether the weights are normalized
 */
declare const isNormalizedWeights: (weights: BigNumberish[]) => boolean;

declare enum ComposableStablePoolJoinKind {
  INIT = 0,
  EXACT_TOKENS_IN_FOR_BPT_OUT = 1,
  TOKEN_IN_FOR_EXACT_BPT_OUT = 2,
}
declare enum ComposableStablePoolExitKind {
  EXACT_BPT_IN_FOR_ONE_TOKEN_OUT = 0,
  BPT_IN_FOR_EXACT_TOKENS_OUT = 1,
  EXACT_BPT_IN_FOR_ALL_TOKENS_OUT = 2,
}
declare class ComposableStablePoolEncoder {
  /**
   * Cannot be constructed.
   */
  private constructor();
  /**
   * Encodes the userData parameter for providing the initial liquidity to a ComposableStablePool
   * @param initialBalances - the amounts of tokens to send to the pool to form the initial balances
   */
  static joinInit: (amountsIn: BigNumberish[]) => string;
  /**
   * Encodes the userData parameter for collecting protocol fees for StablePhantomPool
   */
  static joinCollectProtocolFees: () => string;
  /**
   * Encodes the userData parameter for joining a ComposableStablePool with exact token inputs
   * @param amountsIn - the amounts each of token to deposit in the pool as liquidity
   * @param minimumBPT - the minimum acceptable BPT to receive in return for deposited tokens
   */
  static joinExactTokensInForBPTOut: (
    amountsIn: BigNumberish[],
    minimumBPT: BigNumberish
  ) => string;
  /**
   * Encodes the userData parameter for joining a ComposableStablePool with to receive an exact amount of BPT
   * @param bptAmountOut - the amount of BPT to be minted
   * @param enterTokenIndex - the index of the token to be provided as liquidity
   */
  static joinTokenInForExactBPTOut: (
    bptAmountOut: BigNumberish,
    enterTokenIndex: number
  ) => string;
  /**
   * Encodes the userData parameter for exiting a ComposableStablePool by removing a single token in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   * @param enterTokenIndex - the index of the token to removed from the pool
   */
  static exitExactBPTInForOneTokenOut: (
    bptAmountIn: BigNumberish,
    exitTokenIndex: number
  ) => string;
  /**
   * Encodes the userData parameter for exiting a StablePool by removing tokens in return for an exact amount of BPT
   * @param bptAmountIn - the amount of BPT to be burned
   */
  static exitExactBPTInForAllTokensOut: (bptAmountIn: BigNumberish) => string;
  /**
   * Encodes the userData parameter for exiting a ComposableStablePool by removing exact amounts of tokens
   * @param amountsOut - the amounts of each token to be withdrawn from the pool
   * @param maxBPTAmountIn - the max acceptable BPT to burn in return for withdrawn tokens
   */
  static exitBPTInForExactTokensOut: (
    amountsOut: BigNumberish[],
    maxBPTAmountIn: BigNumberish
  ) => string;
}

declare enum Network {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  GÖRLI = 5,
  OPTIMISM = 10,
  KOVAN = 42,
  GNOSIS = 100,
  POLYGON = 137,
  ARBITRUM = 42161,
}

interface JoinPool {
  poolId: string;
  sender: string;
  recipient: string;
  joinPoolRequest: JoinPoolRequest$1;
}
interface JoinPoolAttributes {
  to: string;
  functionName: string;
  attributes: JoinPool;
  data: string;
  value?: BigNumber;
  minBPTOut: string;
  expectedBPTOut: string;
}
interface ExitPool {
  poolId: string;
  sender: string;
  recipient: string;
  exitPoolRequest: ExitPoolRequest$1;
}
interface ExitPoolAttributes {
  to: string;
  functionName: string;
  attributes: ExitPool;
  data: string;
}
/**
 * Exit exact BPT in transaction parameters
 * @param to Address that will execute the transaction (vault address)
 * @param functionName Function name to be called (exitPool)
 * @param attributes Transaction attributes ready to be encoded
 * @param data Encoded transaction data
 * @param expectedAmountsOut Expected amounts out of exit transaction
 * @param minAmountsOut Minimum amounts out of exit transaction considering slippage tolerance
 */
interface ExitExactBPTInAttributes extends ExitPoolAttributes {
  expectedAmountsOut: string[];
  minAmountsOut: string[];
}
/**
 * Exit exact tokens out transaction parameters
 * @param to Address that will execute the transaction (vault address)
 * @param functionName Function name to be called (exitPool)
 * @param attributes Transaction attributes ready to be encoded
 * @param data Encoded transaction data
 * @param expectedBPTIn Expected BPT into exit transaction
 * @param maxBPTIn Max BPT into exit transaction considering slippage tolerance
 */
interface ExitExactTokensOutAttributes extends ExitPoolAttributes {
  expectedBPTIn: string;
  maxBPTIn: string;
}

declare class GaugeControllerMulticallRepository {
  private gaugeControllerAddress;
  multicall: Contract;
  constructor(
    multicallAddress: string,
    gaugeControllerAddress: string,
    provider: Provider
  );
  getRelativeWeights(
    gaugeAddresses: string[],
    timestamp?: number
  ): Promise<{
    [gaugeAddress: string]: number;
  }>;
}

interface RewardData {
  token: string;
  distributor: string;
  period_finish: BigNumber;
  rate: BigNumber;
  last_update: BigNumber;
  integral: BigNumber;
  decimals?: number;
}
/**
 * A lot of code to get liquidity gauge state via RPC multicall.
 * TODO: reseach helper contracts or extend subgraph
 */
declare class LiquidityGaugesMulticallRepository {
  private chainId;
  multicall: Contract;
  constructor(multicallAddress: string, chainId: Network, provider: Provider);
  getTotalSupplies(gaugeAddresses: string[]): Promise<{
    [gaugeAddress: string]: number;
  }>;
  getWorkingSupplies(gaugeAddresses: string[]): Promise<{
    [gaugeAddress: string]: number;
  }>;
  getRewardCounts(gaugeAddresses: string[]): Promise<{
    [gaugeAddress: string]: number;
  }>;
  getRewardTokens(
    gaugeAddresses: string[],
    passingRewardCounts?: {
      [gaugeAddress: string]: number;
    }
  ): Promise<{
    [gaugeAddress: string]: string[];
  }>;
  getRewardData(
    gaugeAddresses: string[],
    passingRewardTokens?: {
      [gaugeAddress: string]: string[];
    }
  ): Promise<{
    [gaugeAddress: string]: {
      [rewardTokenAddress: string]: RewardData;
    };
  }>;
}

type Maybe$1<T> = T | null;
type InputMaybe$1<T> = Maybe$1<T>;
type Exact$1<
  T extends {
    [key: string]: unknown;
  }
> = {
  [K in keyof T]: T[K];
};
/** All built-in and custom scalars, mapped to their actual values */
type Scalars$1 = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: string;
  BigInt: string;
  Bytes: string;
};
type Balancer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<Balancer_Filter>>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<Balancer_Filter>>>;
  poolCount?: InputMaybe$1<Scalars$1['Int']>;
  poolCount_gt?: InputMaybe$1<Scalars$1['Int']>;
  poolCount_gte?: InputMaybe$1<Scalars$1['Int']>;
  poolCount_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  poolCount_lt?: InputMaybe$1<Scalars$1['Int']>;
  poolCount_lte?: InputMaybe$1<Scalars$1['Int']>;
  poolCount_not?: InputMaybe$1<Scalars$1['Int']>;
  poolCount_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  pools_?: InputMaybe$1<Pool_Filter$1>;
  totalLiquidity?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalLiquidity_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapCount?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  totalSwapCount_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_not?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  totalSwapFee?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapFee_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapVolume?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapVolume_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
};
declare enum Balancer_OrderBy {
  Id = 'id',
  PoolCount = 'poolCount',
  Pools = 'pools',
  TotalLiquidity = 'totalLiquidity',
  TotalSwapCount = 'totalSwapCount',
  TotalSwapFee = 'totalSwapFee',
  TotalSwapVolume = 'totalSwapVolume',
}
type BlockChangedFilter$1 = {
  number_gte: Scalars$1['Int'];
};
type Block_Height$1 = {
  hash?: InputMaybe$1<Scalars$1['Bytes']>;
  number?: InputMaybe$1<Scalars$1['Int']>;
  number_gte?: InputMaybe$1<Scalars$1['Int']>;
};
type GradualWeightUpdate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<GradualWeightUpdate_Filter>>>;
  endTimestamp?: InputMaybe$1<Scalars$1['BigInt']>;
  endTimestamp_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  endTimestamp_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  endTimestamp_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  endTimestamp_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  endTimestamp_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  endTimestamp_not?: InputMaybe$1<Scalars$1['BigInt']>;
  endTimestamp_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  endWeights?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  endWeights_contains?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  endWeights_contains_nocase?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  endWeights_not?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  endWeights_not_contains?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  endWeights_not_contains_nocase?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<GradualWeightUpdate_Filter>>>;
  poolId?: InputMaybe$1<Scalars$1['String']>;
  poolId_?: InputMaybe$1<Pool_Filter$1>;
  poolId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolId_not?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  scheduledTimestamp?: InputMaybe$1<Scalars$1['Int']>;
  scheduledTimestamp_gt?: InputMaybe$1<Scalars$1['Int']>;
  scheduledTimestamp_gte?: InputMaybe$1<Scalars$1['Int']>;
  scheduledTimestamp_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  scheduledTimestamp_lt?: InputMaybe$1<Scalars$1['Int']>;
  scheduledTimestamp_lte?: InputMaybe$1<Scalars$1['Int']>;
  scheduledTimestamp_not?: InputMaybe$1<Scalars$1['Int']>;
  scheduledTimestamp_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  startTimestamp?: InputMaybe$1<Scalars$1['BigInt']>;
  startTimestamp_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  startTimestamp_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  startTimestamp_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  startTimestamp_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  startTimestamp_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  startTimestamp_not?: InputMaybe$1<Scalars$1['BigInt']>;
  startTimestamp_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  startWeights?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  startWeights_contains?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  startWeights_contains_nocase?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  startWeights_not?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  startWeights_not_contains?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  startWeights_not_contains_nocase?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
};
declare enum InvestType {
  Exit = 'Exit',
  Join = 'Join',
}
type JoinExit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  amounts?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_contains?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_contains_nocase?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_not?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_not_contains?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_not_contains_nocase?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  and?: InputMaybe$1<Array<InputMaybe$1<JoinExit_Filter>>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<JoinExit_Filter>>>;
  pool?: InputMaybe$1<Scalars$1['String']>;
  pool_?: InputMaybe$1<Pool_Filter$1>;
  pool_contains?: InputMaybe$1<Scalars$1['String']>;
  pool_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_ends_with?: InputMaybe$1<Scalars$1['String']>;
  pool_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_gt?: InputMaybe$1<Scalars$1['String']>;
  pool_gte?: InputMaybe$1<Scalars$1['String']>;
  pool_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  pool_lt?: InputMaybe$1<Scalars$1['String']>;
  pool_lte?: InputMaybe$1<Scalars$1['String']>;
  pool_not?: InputMaybe$1<Scalars$1['String']>;
  pool_not_contains?: InputMaybe$1<Scalars$1['String']>;
  pool_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  pool_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  pool_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  pool_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_starts_with?: InputMaybe$1<Scalars$1['String']>;
  pool_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  sender?: InputMaybe$1<Scalars$1['Bytes']>;
  sender_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  sender_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  sender_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  sender_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  sender_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  sender_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  sender_not?: InputMaybe$1<Scalars$1['Bytes']>;
  sender_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  sender_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  timestamp?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  timestamp_lt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_lte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  tx?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tx_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  type?: InputMaybe$1<InvestType>;
  type_in?: InputMaybe$1<Array<InvestType>>;
  type_not?: InputMaybe$1<InvestType>;
  type_not_in?: InputMaybe$1<Array<InvestType>>;
  user?: InputMaybe$1<Scalars$1['String']>;
  user_?: InputMaybe$1<User_Filter$1>;
  user_contains?: InputMaybe$1<Scalars$1['String']>;
  user_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  user_ends_with?: InputMaybe$1<Scalars$1['String']>;
  user_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  user_gt?: InputMaybe$1<Scalars$1['String']>;
  user_gte?: InputMaybe$1<Scalars$1['String']>;
  user_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  user_lt?: InputMaybe$1<Scalars$1['String']>;
  user_lte?: InputMaybe$1<Scalars$1['String']>;
  user_not?: InputMaybe$1<Scalars$1['String']>;
  user_not_contains?: InputMaybe$1<Scalars$1['String']>;
  user_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  user_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  user_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  user_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  user_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  user_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  user_starts_with?: InputMaybe$1<Scalars$1['String']>;
  user_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  valueUSD?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  valueUSD_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
};
declare enum JoinExit_OrderBy {
  Amounts = 'amounts',
  Id = 'id',
  Pool = 'pool',
  PoolAddress = 'pool__address',
  PoolAlpha = 'pool__alpha',
  PoolAmp = 'pool__amp',
  PoolBaseToken = 'pool__baseToken',
  PoolBeta = 'pool__beta',
  PoolC = 'pool__c',
  PoolCreateTime = 'pool__createTime',
  PoolDSq = 'pool__dSq',
  PoolDelta = 'pool__delta',
  PoolEpsilon = 'pool__epsilon',
  PoolExpiryTime = 'pool__expiryTime',
  PoolFactory = 'pool__factory',
  PoolHoldersCount = 'pool__holdersCount',
  PoolId = 'pool__id',
  PoolIsInRecoveryMode = 'pool__isInRecoveryMode',
  PoolIsPaused = 'pool__isPaused',
  PoolLambda = 'pool__lambda',
  PoolLowerTarget = 'pool__lowerTarget',
  PoolMainIndex = 'pool__mainIndex',
  PoolManagementFee = 'pool__managementFee',
  PoolName = 'pool__name',
  PoolOracleEnabled = 'pool__oracleEnabled',
  PoolOwner = 'pool__owner',
  PoolPoolType = 'pool__poolType',
  PoolPoolTypeVersion = 'pool__poolTypeVersion',
  PoolPrincipalToken = 'pool__principalToken',
  PoolProtocolAumFeeCache = 'pool__protocolAumFeeCache',
  PoolProtocolId = 'pool__protocolId',
  PoolProtocolSwapFeeCache = 'pool__protocolSwapFeeCache',
  PoolProtocolYieldFeeCache = 'pool__protocolYieldFeeCache',
  PoolRoot3Alpha = 'pool__root3Alpha',
  PoolS = 'pool__s',
  PoolSqrtAlpha = 'pool__sqrtAlpha',
  PoolSqrtBeta = 'pool__sqrtBeta',
  PoolStrategyType = 'pool__strategyType',
  PoolSwapEnabled = 'pool__swapEnabled',
  PoolSwapFee = 'pool__swapFee',
  PoolSwapsCount = 'pool__swapsCount',
  PoolSymbol = 'pool__symbol',
  PoolTauAlphaX = 'pool__tauAlphaX',
  PoolTauAlphaY = 'pool__tauAlphaY',
  PoolTauBetaX = 'pool__tauBetaX',
  PoolTauBetaY = 'pool__tauBetaY',
  PoolTotalLiquidity = 'pool__totalLiquidity',
  PoolTotalShares = 'pool__totalShares',
  PoolTotalSwapFee = 'pool__totalSwapFee',
  PoolTotalSwapVolume = 'pool__totalSwapVolume',
  PoolTotalWeight = 'pool__totalWeight',
  PoolTx = 'pool__tx',
  PoolU = 'pool__u',
  PoolUnitSeconds = 'pool__unitSeconds',
  PoolUpperTarget = 'pool__upperTarget',
  PoolV = 'pool__v',
  PoolW = 'pool__w',
  PoolWrappedIndex = 'pool__wrappedIndex',
  PoolZ = 'pool__z',
  Sender = 'sender',
  Timestamp = 'timestamp',
  Tx = 'tx',
  Type = 'type',
  User = 'user',
  UserId = 'user__id',
  ValueUsd = 'valueUSD',
}
type LatestPrice_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<LatestPrice_Filter>>>;
  asset?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  asset_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_not?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  block?: InputMaybe$1<Scalars$1['BigInt']>;
  block_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  block_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  block_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  block_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  block_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  block_not?: InputMaybe$1<Scalars$1['BigInt']>;
  block_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<LatestPrice_Filter>>>;
  poolId?: InputMaybe$1<Scalars$1['String']>;
  poolId_?: InputMaybe$1<Pool_Filter$1>;
  poolId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolId_not?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  price?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  price_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  pricingAsset?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  pricingAsset_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
};
declare enum LatestPrice_OrderBy {
  Asset = 'asset',
  Block = 'block',
  Id = 'id',
  PoolId = 'poolId',
  PoolIdAddress = 'poolId__address',
  PoolIdAlpha = 'poolId__alpha',
  PoolIdAmp = 'poolId__amp',
  PoolIdBaseToken = 'poolId__baseToken',
  PoolIdBeta = 'poolId__beta',
  PoolIdC = 'poolId__c',
  PoolIdCreateTime = 'poolId__createTime',
  PoolIdDSq = 'poolId__dSq',
  PoolIdDelta = 'poolId__delta',
  PoolIdEpsilon = 'poolId__epsilon',
  PoolIdExpiryTime = 'poolId__expiryTime',
  PoolIdFactory = 'poolId__factory',
  PoolIdHoldersCount = 'poolId__holdersCount',
  PoolIdId = 'poolId__id',
  PoolIdIsInRecoveryMode = 'poolId__isInRecoveryMode',
  PoolIdIsPaused = 'poolId__isPaused',
  PoolIdLambda = 'poolId__lambda',
  PoolIdLowerTarget = 'poolId__lowerTarget',
  PoolIdMainIndex = 'poolId__mainIndex',
  PoolIdManagementFee = 'poolId__managementFee',
  PoolIdName = 'poolId__name',
  PoolIdOracleEnabled = 'poolId__oracleEnabled',
  PoolIdOwner = 'poolId__owner',
  PoolIdPoolType = 'poolId__poolType',
  PoolIdPoolTypeVersion = 'poolId__poolTypeVersion',
  PoolIdPrincipalToken = 'poolId__principalToken',
  PoolIdProtocolAumFeeCache = 'poolId__protocolAumFeeCache',
  PoolIdProtocolId = 'poolId__protocolId',
  PoolIdProtocolSwapFeeCache = 'poolId__protocolSwapFeeCache',
  PoolIdProtocolYieldFeeCache = 'poolId__protocolYieldFeeCache',
  PoolIdRoot3Alpha = 'poolId__root3Alpha',
  PoolIdS = 'poolId__s',
  PoolIdSqrtAlpha = 'poolId__sqrtAlpha',
  PoolIdSqrtBeta = 'poolId__sqrtBeta',
  PoolIdStrategyType = 'poolId__strategyType',
  PoolIdSwapEnabled = 'poolId__swapEnabled',
  PoolIdSwapFee = 'poolId__swapFee',
  PoolIdSwapsCount = 'poolId__swapsCount',
  PoolIdSymbol = 'poolId__symbol',
  PoolIdTauAlphaX = 'poolId__tauAlphaX',
  PoolIdTauAlphaY = 'poolId__tauAlphaY',
  PoolIdTauBetaX = 'poolId__tauBetaX',
  PoolIdTauBetaY = 'poolId__tauBetaY',
  PoolIdTotalLiquidity = 'poolId__totalLiquidity',
  PoolIdTotalShares = 'poolId__totalShares',
  PoolIdTotalSwapFee = 'poolId__totalSwapFee',
  PoolIdTotalSwapVolume = 'poolId__totalSwapVolume',
  PoolIdTotalWeight = 'poolId__totalWeight',
  PoolIdTx = 'poolId__tx',
  PoolIdU = 'poolId__u',
  PoolIdUnitSeconds = 'poolId__unitSeconds',
  PoolIdUpperTarget = 'poolId__upperTarget',
  PoolIdV = 'poolId__v',
  PoolIdW = 'poolId__w',
  PoolIdWrappedIndex = 'poolId__wrappedIndex',
  PoolIdZ = 'poolId__z',
  Price = 'price',
  PricingAsset = 'pricingAsset',
}
type ManagementOperation_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<ManagementOperation_Filter>>>;
  cashDelta?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashDelta_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashDelta_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashDelta_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  cashDelta_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashDelta_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashDelta_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashDelta_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  managedDelta?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedDelta_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedDelta_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedDelta_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  managedDelta_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedDelta_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedDelta_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedDelta_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<ManagementOperation_Filter>>>;
  poolTokenId?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_?: InputMaybe$1<PoolToken_Filter>;
  poolTokenId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolTokenId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_not?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolTokenId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolTokenId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  timestamp?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  timestamp_lt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_lte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  type?: InputMaybe$1<OperationType>;
  type_in?: InputMaybe$1<Array<OperationType>>;
  type_not?: InputMaybe$1<OperationType>;
  type_not_in?: InputMaybe$1<Array<OperationType>>;
};
declare enum OperationType {
  Deposit = 'Deposit',
  Update = 'Update',
  Withdraw = 'Withdraw',
}
/** Defines the order direction, either ascending or descending */
declare enum OrderDirection$1 {
  Asc = 'asc',
  Desc = 'desc',
}
type PoolHistoricalLiquidity_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<PoolHistoricalLiquidity_Filter>>>;
  block?: InputMaybe$1<Scalars$1['BigInt']>;
  block_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  block_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  block_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  block_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  block_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  block_not?: InputMaybe$1<Scalars$1['BigInt']>;
  block_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<PoolHistoricalLiquidity_Filter>>>;
  poolId?: InputMaybe$1<Scalars$1['String']>;
  poolId_?: InputMaybe$1<Pool_Filter$1>;
  poolId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolId_not?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolLiquidity?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolLiquidity_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolLiquidity_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolLiquidity_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  poolLiquidity_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolLiquidity_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolLiquidity_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolLiquidity_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  poolShareValue?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolShareValue_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolShareValue_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolShareValue_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  poolShareValue_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolShareValue_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolShareValue_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolShareValue_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  poolTotalShares?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolTotalShares_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolTotalShares_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolTotalShares_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  poolTotalShares_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolTotalShares_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolTotalShares_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  poolTotalShares_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  pricingAsset?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  pricingAsset_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
};
declare enum PoolHistoricalLiquidity_OrderBy {
  Block = 'block',
  Id = 'id',
  PoolId = 'poolId',
  PoolIdAddress = 'poolId__address',
  PoolIdAlpha = 'poolId__alpha',
  PoolIdAmp = 'poolId__amp',
  PoolIdBaseToken = 'poolId__baseToken',
  PoolIdBeta = 'poolId__beta',
  PoolIdC = 'poolId__c',
  PoolIdCreateTime = 'poolId__createTime',
  PoolIdDSq = 'poolId__dSq',
  PoolIdDelta = 'poolId__delta',
  PoolIdEpsilon = 'poolId__epsilon',
  PoolIdExpiryTime = 'poolId__expiryTime',
  PoolIdFactory = 'poolId__factory',
  PoolIdHoldersCount = 'poolId__holdersCount',
  PoolIdId = 'poolId__id',
  PoolIdIsInRecoveryMode = 'poolId__isInRecoveryMode',
  PoolIdIsPaused = 'poolId__isPaused',
  PoolIdLambda = 'poolId__lambda',
  PoolIdLowerTarget = 'poolId__lowerTarget',
  PoolIdMainIndex = 'poolId__mainIndex',
  PoolIdManagementFee = 'poolId__managementFee',
  PoolIdName = 'poolId__name',
  PoolIdOracleEnabled = 'poolId__oracleEnabled',
  PoolIdOwner = 'poolId__owner',
  PoolIdPoolType = 'poolId__poolType',
  PoolIdPoolTypeVersion = 'poolId__poolTypeVersion',
  PoolIdPrincipalToken = 'poolId__principalToken',
  PoolIdProtocolAumFeeCache = 'poolId__protocolAumFeeCache',
  PoolIdProtocolId = 'poolId__protocolId',
  PoolIdProtocolSwapFeeCache = 'poolId__protocolSwapFeeCache',
  PoolIdProtocolYieldFeeCache = 'poolId__protocolYieldFeeCache',
  PoolIdRoot3Alpha = 'poolId__root3Alpha',
  PoolIdS = 'poolId__s',
  PoolIdSqrtAlpha = 'poolId__sqrtAlpha',
  PoolIdSqrtBeta = 'poolId__sqrtBeta',
  PoolIdStrategyType = 'poolId__strategyType',
  PoolIdSwapEnabled = 'poolId__swapEnabled',
  PoolIdSwapFee = 'poolId__swapFee',
  PoolIdSwapsCount = 'poolId__swapsCount',
  PoolIdSymbol = 'poolId__symbol',
  PoolIdTauAlphaX = 'poolId__tauAlphaX',
  PoolIdTauAlphaY = 'poolId__tauAlphaY',
  PoolIdTauBetaX = 'poolId__tauBetaX',
  PoolIdTauBetaY = 'poolId__tauBetaY',
  PoolIdTotalLiquidity = 'poolId__totalLiquidity',
  PoolIdTotalShares = 'poolId__totalShares',
  PoolIdTotalSwapFee = 'poolId__totalSwapFee',
  PoolIdTotalSwapVolume = 'poolId__totalSwapVolume',
  PoolIdTotalWeight = 'poolId__totalWeight',
  PoolIdTx = 'poolId__tx',
  PoolIdU = 'poolId__u',
  PoolIdUnitSeconds = 'poolId__unitSeconds',
  PoolIdUpperTarget = 'poolId__upperTarget',
  PoolIdV = 'poolId__v',
  PoolIdW = 'poolId__w',
  PoolIdWrappedIndex = 'poolId__wrappedIndex',
  PoolIdZ = 'poolId__z',
  PoolLiquidity = 'poolLiquidity',
  PoolShareValue = 'poolShareValue',
  PoolTotalShares = 'poolTotalShares',
  PricingAsset = 'pricingAsset',
}
type PoolShare_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<PoolShare_Filter>>>;
  balance?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  balance_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<PoolShare_Filter>>>;
  poolId?: InputMaybe$1<Scalars$1['String']>;
  poolId_?: InputMaybe$1<Pool_Filter$1>;
  poolId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolId_not?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress?: InputMaybe$1<Scalars$1['String']>;
  userAddress_?: InputMaybe$1<User_Filter$1>;
  userAddress_contains?: InputMaybe$1<Scalars$1['String']>;
  userAddress_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_ends_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_gt?: InputMaybe$1<Scalars$1['String']>;
  userAddress_gte?: InputMaybe$1<Scalars$1['String']>;
  userAddress_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  userAddress_lt?: InputMaybe$1<Scalars$1['String']>;
  userAddress_lte?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_contains?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  userAddress_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_starts_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
};
declare enum PoolShare_OrderBy {
  Balance = 'balance',
  Id = 'id',
  PoolId = 'poolId',
  PoolIdAddress = 'poolId__address',
  PoolIdAlpha = 'poolId__alpha',
  PoolIdAmp = 'poolId__amp',
  PoolIdBaseToken = 'poolId__baseToken',
  PoolIdBeta = 'poolId__beta',
  PoolIdC = 'poolId__c',
  PoolIdCreateTime = 'poolId__createTime',
  PoolIdDSq = 'poolId__dSq',
  PoolIdDelta = 'poolId__delta',
  PoolIdEpsilon = 'poolId__epsilon',
  PoolIdExpiryTime = 'poolId__expiryTime',
  PoolIdFactory = 'poolId__factory',
  PoolIdHoldersCount = 'poolId__holdersCount',
  PoolIdId = 'poolId__id',
  PoolIdIsInRecoveryMode = 'poolId__isInRecoveryMode',
  PoolIdIsPaused = 'poolId__isPaused',
  PoolIdLambda = 'poolId__lambda',
  PoolIdLowerTarget = 'poolId__lowerTarget',
  PoolIdMainIndex = 'poolId__mainIndex',
  PoolIdManagementFee = 'poolId__managementFee',
  PoolIdName = 'poolId__name',
  PoolIdOracleEnabled = 'poolId__oracleEnabled',
  PoolIdOwner = 'poolId__owner',
  PoolIdPoolType = 'poolId__poolType',
  PoolIdPoolTypeVersion = 'poolId__poolTypeVersion',
  PoolIdPrincipalToken = 'poolId__principalToken',
  PoolIdProtocolAumFeeCache = 'poolId__protocolAumFeeCache',
  PoolIdProtocolId = 'poolId__protocolId',
  PoolIdProtocolSwapFeeCache = 'poolId__protocolSwapFeeCache',
  PoolIdProtocolYieldFeeCache = 'poolId__protocolYieldFeeCache',
  PoolIdRoot3Alpha = 'poolId__root3Alpha',
  PoolIdS = 'poolId__s',
  PoolIdSqrtAlpha = 'poolId__sqrtAlpha',
  PoolIdSqrtBeta = 'poolId__sqrtBeta',
  PoolIdStrategyType = 'poolId__strategyType',
  PoolIdSwapEnabled = 'poolId__swapEnabled',
  PoolIdSwapFee = 'poolId__swapFee',
  PoolIdSwapsCount = 'poolId__swapsCount',
  PoolIdSymbol = 'poolId__symbol',
  PoolIdTauAlphaX = 'poolId__tauAlphaX',
  PoolIdTauAlphaY = 'poolId__tauAlphaY',
  PoolIdTauBetaX = 'poolId__tauBetaX',
  PoolIdTauBetaY = 'poolId__tauBetaY',
  PoolIdTotalLiquidity = 'poolId__totalLiquidity',
  PoolIdTotalShares = 'poolId__totalShares',
  PoolIdTotalSwapFee = 'poolId__totalSwapFee',
  PoolIdTotalSwapVolume = 'poolId__totalSwapVolume',
  PoolIdTotalWeight = 'poolId__totalWeight',
  PoolIdTx = 'poolId__tx',
  PoolIdU = 'poolId__u',
  PoolIdUnitSeconds = 'poolId__unitSeconds',
  PoolIdUpperTarget = 'poolId__upperTarget',
  PoolIdV = 'poolId__v',
  PoolIdW = 'poolId__w',
  PoolIdWrappedIndex = 'poolId__wrappedIndex',
  PoolIdZ = 'poolId__z',
  UserAddress = 'userAddress',
  UserAddressId = 'userAddress__id',
}
type PoolSnapshot_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  amounts?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_contains?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_contains_nocase?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_not?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_not_contains?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amounts_not_contains_nocase?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  and?: InputMaybe$1<Array<InputMaybe$1<PoolSnapshot_Filter>>>;
  holdersCount?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  holdersCount_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_not?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  liquidity?: InputMaybe$1<Scalars$1['BigDecimal']>;
  liquidity_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  liquidity_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  liquidity_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  liquidity_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  liquidity_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  liquidity_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  liquidity_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<PoolSnapshot_Filter>>>;
  pool?: InputMaybe$1<Scalars$1['String']>;
  pool_?: InputMaybe$1<Pool_Filter$1>;
  pool_contains?: InputMaybe$1<Scalars$1['String']>;
  pool_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_ends_with?: InputMaybe$1<Scalars$1['String']>;
  pool_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_gt?: InputMaybe$1<Scalars$1['String']>;
  pool_gte?: InputMaybe$1<Scalars$1['String']>;
  pool_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  pool_lt?: InputMaybe$1<Scalars$1['String']>;
  pool_lte?: InputMaybe$1<Scalars$1['String']>;
  pool_not?: InputMaybe$1<Scalars$1['String']>;
  pool_not_contains?: InputMaybe$1<Scalars$1['String']>;
  pool_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  pool_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  pool_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  pool_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_starts_with?: InputMaybe$1<Scalars$1['String']>;
  pool_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  swapFees?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFees_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFees_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFees_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  swapFees_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFees_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFees_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFees_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  swapVolume?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapVolume_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapVolume_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapVolume_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  swapVolume_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapVolume_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapVolume_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapVolume_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  swapsCount?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  swapsCount_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_not?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  timestamp?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  timestamp_lt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_lte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  totalShares?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalShares_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
};
declare enum PoolSnapshot_OrderBy {
  Amounts = 'amounts',
  HoldersCount = 'holdersCount',
  Id = 'id',
  Liquidity = 'liquidity',
  Pool = 'pool',
  PoolAddress = 'pool__address',
  PoolAlpha = 'pool__alpha',
  PoolAmp = 'pool__amp',
  PoolBaseToken = 'pool__baseToken',
  PoolBeta = 'pool__beta',
  PoolC = 'pool__c',
  PoolCreateTime = 'pool__createTime',
  PoolDSq = 'pool__dSq',
  PoolDelta = 'pool__delta',
  PoolEpsilon = 'pool__epsilon',
  PoolExpiryTime = 'pool__expiryTime',
  PoolFactory = 'pool__factory',
  PoolHoldersCount = 'pool__holdersCount',
  PoolId = 'pool__id',
  PoolIsInRecoveryMode = 'pool__isInRecoveryMode',
  PoolIsPaused = 'pool__isPaused',
  PoolLambda = 'pool__lambda',
  PoolLowerTarget = 'pool__lowerTarget',
  PoolMainIndex = 'pool__mainIndex',
  PoolManagementFee = 'pool__managementFee',
  PoolName = 'pool__name',
  PoolOracleEnabled = 'pool__oracleEnabled',
  PoolOwner = 'pool__owner',
  PoolPoolType = 'pool__poolType',
  PoolPoolTypeVersion = 'pool__poolTypeVersion',
  PoolPrincipalToken = 'pool__principalToken',
  PoolProtocolAumFeeCache = 'pool__protocolAumFeeCache',
  PoolProtocolId = 'pool__protocolId',
  PoolProtocolSwapFeeCache = 'pool__protocolSwapFeeCache',
  PoolProtocolYieldFeeCache = 'pool__protocolYieldFeeCache',
  PoolRoot3Alpha = 'pool__root3Alpha',
  PoolS = 'pool__s',
  PoolSqrtAlpha = 'pool__sqrtAlpha',
  PoolSqrtBeta = 'pool__sqrtBeta',
  PoolStrategyType = 'pool__strategyType',
  PoolSwapEnabled = 'pool__swapEnabled',
  PoolSwapFee = 'pool__swapFee',
  PoolSwapsCount = 'pool__swapsCount',
  PoolSymbol = 'pool__symbol',
  PoolTauAlphaX = 'pool__tauAlphaX',
  PoolTauAlphaY = 'pool__tauAlphaY',
  PoolTauBetaX = 'pool__tauBetaX',
  PoolTauBetaY = 'pool__tauBetaY',
  PoolTotalLiquidity = 'pool__totalLiquidity',
  PoolTotalShares = 'pool__totalShares',
  PoolTotalSwapFee = 'pool__totalSwapFee',
  PoolTotalSwapVolume = 'pool__totalSwapVolume',
  PoolTotalWeight = 'pool__totalWeight',
  PoolTx = 'pool__tx',
  PoolU = 'pool__u',
  PoolUnitSeconds = 'pool__unitSeconds',
  PoolUpperTarget = 'pool__upperTarget',
  PoolV = 'pool__v',
  PoolW = 'pool__w',
  PoolWrappedIndex = 'pool__wrappedIndex',
  PoolZ = 'pool__z',
  SwapFees = 'swapFees',
  SwapVolume = 'swapVolume',
  SwapsCount = 'swapsCount',
  Timestamp = 'timestamp',
  TotalShares = 'totalShares',
}
type PoolToken_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  address?: InputMaybe$1<Scalars$1['String']>;
  address_contains?: InputMaybe$1<Scalars$1['String']>;
  address_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_ends_with?: InputMaybe$1<Scalars$1['String']>;
  address_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_gt?: InputMaybe$1<Scalars$1['String']>;
  address_gte?: InputMaybe$1<Scalars$1['String']>;
  address_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  address_lt?: InputMaybe$1<Scalars$1['String']>;
  address_lte?: InputMaybe$1<Scalars$1['String']>;
  address_not?: InputMaybe$1<Scalars$1['String']>;
  address_not_contains?: InputMaybe$1<Scalars$1['String']>;
  address_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  address_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  address_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  address_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_starts_with?: InputMaybe$1<Scalars$1['String']>;
  address_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  and?: InputMaybe$1<Array<InputMaybe$1<PoolToken_Filter>>>;
  assetManager?: InputMaybe$1<Scalars$1['Bytes']>;
  assetManager_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  assetManager_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  assetManager_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  assetManager_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  assetManager_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  assetManager_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  assetManager_not?: InputMaybe$1<Scalars$1['Bytes']>;
  assetManager_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  assetManager_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  balance?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  balance_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  cashBalance?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashBalance_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashBalance_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashBalance_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  cashBalance_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashBalance_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashBalance_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  cashBalance_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  decimals?: InputMaybe$1<Scalars$1['Int']>;
  decimals_gt?: InputMaybe$1<Scalars$1['Int']>;
  decimals_gte?: InputMaybe$1<Scalars$1['Int']>;
  decimals_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  decimals_lt?: InputMaybe$1<Scalars$1['Int']>;
  decimals_lte?: InputMaybe$1<Scalars$1['Int']>;
  decimals_not?: InputMaybe$1<Scalars$1['Int']>;
  decimals_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  index?: InputMaybe$1<Scalars$1['Int']>;
  index_gt?: InputMaybe$1<Scalars$1['Int']>;
  index_gte?: InputMaybe$1<Scalars$1['Int']>;
  index_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  index_lt?: InputMaybe$1<Scalars$1['Int']>;
  index_lte?: InputMaybe$1<Scalars$1['Int']>;
  index_not?: InputMaybe$1<Scalars$1['Int']>;
  index_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  isExemptFromYieldProtocolFee?: InputMaybe$1<Scalars$1['Boolean']>;
  isExemptFromYieldProtocolFee_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  isExemptFromYieldProtocolFee_not?: InputMaybe$1<Scalars$1['Boolean']>;
  isExemptFromYieldProtocolFee_not_in?: InputMaybe$1<
    Array<Scalars$1['Boolean']>
  >;
  managedBalance?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedBalance_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedBalance_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedBalance_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  managedBalance_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedBalance_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedBalance_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managedBalance_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  managements_?: InputMaybe$1<ManagementOperation_Filter>;
  name?: InputMaybe$1<Scalars$1['String']>;
  name_contains?: InputMaybe$1<Scalars$1['String']>;
  name_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_ends_with?: InputMaybe$1<Scalars$1['String']>;
  name_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_gt?: InputMaybe$1<Scalars$1['String']>;
  name_gte?: InputMaybe$1<Scalars$1['String']>;
  name_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  name_lt?: InputMaybe$1<Scalars$1['String']>;
  name_lte?: InputMaybe$1<Scalars$1['String']>;
  name_not?: InputMaybe$1<Scalars$1['String']>;
  name_not_contains?: InputMaybe$1<Scalars$1['String']>;
  name_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  name_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  name_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  name_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_starts_with?: InputMaybe$1<Scalars$1['String']>;
  name_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  or?: InputMaybe$1<Array<InputMaybe$1<PoolToken_Filter>>>;
  poolId?: InputMaybe$1<Scalars$1['String']>;
  poolId_?: InputMaybe$1<Pool_Filter$1>;
  poolId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolId_not?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  priceRate?: InputMaybe$1<Scalars$1['BigDecimal']>;
  priceRate_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  priceRate_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  priceRate_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  priceRate_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  priceRate_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  priceRate_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  priceRate_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  symbol?: InputMaybe$1<Scalars$1['String']>;
  symbol_contains?: InputMaybe$1<Scalars$1['String']>;
  symbol_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_ends_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_gt?: InputMaybe$1<Scalars$1['String']>;
  symbol_gte?: InputMaybe$1<Scalars$1['String']>;
  symbol_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  symbol_lt?: InputMaybe$1<Scalars$1['String']>;
  symbol_lte?: InputMaybe$1<Scalars$1['String']>;
  symbol_not?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_contains?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  symbol_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_starts_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  token?: InputMaybe$1<Scalars$1['String']>;
  token_?: InputMaybe$1<Token_Filter>;
  token_contains?: InputMaybe$1<Scalars$1['String']>;
  token_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_ends_with?: InputMaybe$1<Scalars$1['String']>;
  token_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_gt?: InputMaybe$1<Scalars$1['String']>;
  token_gte?: InputMaybe$1<Scalars$1['String']>;
  token_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  token_lt?: InputMaybe$1<Scalars$1['String']>;
  token_lte?: InputMaybe$1<Scalars$1['String']>;
  token_not?: InputMaybe$1<Scalars$1['String']>;
  token_not_contains?: InputMaybe$1<Scalars$1['String']>;
  token_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  token_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  token_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  token_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_starts_with?: InputMaybe$1<Scalars$1['String']>;
  token_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  weight?: InputMaybe$1<Scalars$1['BigDecimal']>;
  weight_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  weight_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  weight_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  weight_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  weight_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  weight_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  weight_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
};
type Pool_Filter$1 = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  address?: InputMaybe$1<Scalars$1['Bytes']>;
  address_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  address_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  address_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  address_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  address_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  address_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  address_not?: InputMaybe$1<Scalars$1['Bytes']>;
  address_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  address_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  alpha?: InputMaybe$1<Scalars$1['BigDecimal']>;
  alpha_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  alpha_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  alpha_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  alpha_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  alpha_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  alpha_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  alpha_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amp?: InputMaybe$1<Scalars$1['BigInt']>;
  amp_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  amp_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  amp_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  amp_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  amp_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  amp_not?: InputMaybe$1<Scalars$1['BigInt']>;
  amp_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  and?: InputMaybe$1<Array<InputMaybe$1<Pool_Filter$1>>>;
  baseToken?: InputMaybe$1<Scalars$1['Bytes']>;
  baseToken_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  baseToken_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  baseToken_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  baseToken_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  baseToken_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  baseToken_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  baseToken_not?: InputMaybe$1<Scalars$1['Bytes']>;
  baseToken_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  baseToken_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  beta?: InputMaybe$1<Scalars$1['BigDecimal']>;
  beta_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  beta_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  beta_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  beta_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  beta_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  beta_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  beta_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  c?: InputMaybe$1<Scalars$1['BigDecimal']>;
  c_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  c_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  c_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  c_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  c_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  c_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  c_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  createTime?: InputMaybe$1<Scalars$1['Int']>;
  createTime_gt?: InputMaybe$1<Scalars$1['Int']>;
  createTime_gte?: InputMaybe$1<Scalars$1['Int']>;
  createTime_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  createTime_lt?: InputMaybe$1<Scalars$1['Int']>;
  createTime_lte?: InputMaybe$1<Scalars$1['Int']>;
  createTime_not?: InputMaybe$1<Scalars$1['Int']>;
  createTime_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  dSq?: InputMaybe$1<Scalars$1['BigDecimal']>;
  dSq_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  dSq_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  dSq_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  dSq_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  dSq_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  dSq_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  dSq_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  delta?: InputMaybe$1<Scalars$1['BigDecimal']>;
  delta_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  delta_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  delta_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  delta_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  delta_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  delta_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  delta_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  epsilon?: InputMaybe$1<Scalars$1['BigDecimal']>;
  epsilon_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  epsilon_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  epsilon_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  epsilon_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  epsilon_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  epsilon_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  epsilon_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  expiryTime?: InputMaybe$1<Scalars$1['BigInt']>;
  expiryTime_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  expiryTime_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  expiryTime_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  expiryTime_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  expiryTime_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  expiryTime_not?: InputMaybe$1<Scalars$1['BigInt']>;
  expiryTime_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  factory?: InputMaybe$1<Scalars$1['Bytes']>;
  factory_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  factory_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  factory_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  factory_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  factory_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  factory_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  factory_not?: InputMaybe$1<Scalars$1['Bytes']>;
  factory_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  factory_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  historicalValues_?: InputMaybe$1<PoolHistoricalLiquidity_Filter>;
  holdersCount?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  holdersCount_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_not?: InputMaybe$1<Scalars$1['BigInt']>;
  holdersCount_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  isInRecoveryMode?: InputMaybe$1<Scalars$1['Boolean']>;
  isInRecoveryMode_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  isInRecoveryMode_not?: InputMaybe$1<Scalars$1['Boolean']>;
  isInRecoveryMode_not_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  isPaused?: InputMaybe$1<Scalars$1['Boolean']>;
  isPaused_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  isPaused_not?: InputMaybe$1<Scalars$1['Boolean']>;
  isPaused_not_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  lambda?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lambda_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lambda_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lambda_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  lambda_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lambda_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lambda_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lambda_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  lowerTarget?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lowerTarget_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lowerTarget_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lowerTarget_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  lowerTarget_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lowerTarget_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lowerTarget_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  lowerTarget_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  mainIndex?: InputMaybe$1<Scalars$1['Int']>;
  mainIndex_gt?: InputMaybe$1<Scalars$1['Int']>;
  mainIndex_gte?: InputMaybe$1<Scalars$1['Int']>;
  mainIndex_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  mainIndex_lt?: InputMaybe$1<Scalars$1['Int']>;
  mainIndex_lte?: InputMaybe$1<Scalars$1['Int']>;
  mainIndex_not?: InputMaybe$1<Scalars$1['Int']>;
  mainIndex_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  managementFee?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managementFee_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managementFee_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managementFee_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  managementFee_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managementFee_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managementFee_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  managementFee_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  name?: InputMaybe$1<Scalars$1['String']>;
  name_contains?: InputMaybe$1<Scalars$1['String']>;
  name_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_ends_with?: InputMaybe$1<Scalars$1['String']>;
  name_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_gt?: InputMaybe$1<Scalars$1['String']>;
  name_gte?: InputMaybe$1<Scalars$1['String']>;
  name_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  name_lt?: InputMaybe$1<Scalars$1['String']>;
  name_lte?: InputMaybe$1<Scalars$1['String']>;
  name_not?: InputMaybe$1<Scalars$1['String']>;
  name_not_contains?: InputMaybe$1<Scalars$1['String']>;
  name_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  name_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  name_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  name_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_starts_with?: InputMaybe$1<Scalars$1['String']>;
  name_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  or?: InputMaybe$1<Array<InputMaybe$1<Pool_Filter$1>>>;
  oracleEnabled?: InputMaybe$1<Scalars$1['Boolean']>;
  oracleEnabled_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  oracleEnabled_not?: InputMaybe$1<Scalars$1['Boolean']>;
  oracleEnabled_not_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  owner?: InputMaybe$1<Scalars$1['Bytes']>;
  owner_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  owner_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  owner_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  owner_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  owner_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  owner_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  owner_not?: InputMaybe$1<Scalars$1['Bytes']>;
  owner_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  owner_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  poolType?: InputMaybe$1<Scalars$1['String']>;
  poolTypeVersion?: InputMaybe$1<Scalars$1['Int']>;
  poolTypeVersion_gt?: InputMaybe$1<Scalars$1['Int']>;
  poolTypeVersion_gte?: InputMaybe$1<Scalars$1['Int']>;
  poolTypeVersion_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  poolTypeVersion_lt?: InputMaybe$1<Scalars$1['Int']>;
  poolTypeVersion_lte?: InputMaybe$1<Scalars$1['Int']>;
  poolTypeVersion_not?: InputMaybe$1<Scalars$1['Int']>;
  poolTypeVersion_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  poolType_contains?: InputMaybe$1<Scalars$1['String']>;
  poolType_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolType_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolType_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolType_gt?: InputMaybe$1<Scalars$1['String']>;
  poolType_gte?: InputMaybe$1<Scalars$1['String']>;
  poolType_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolType_lt?: InputMaybe$1<Scalars$1['String']>;
  poolType_lte?: InputMaybe$1<Scalars$1['String']>;
  poolType_not?: InputMaybe$1<Scalars$1['String']>;
  poolType_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolType_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolType_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolType_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolType_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolType_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolType_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolType_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolType_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  priceRateProviders_?: InputMaybe$1<PriceRateProvider_Filter>;
  principalToken?: InputMaybe$1<Scalars$1['Bytes']>;
  principalToken_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  principalToken_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  principalToken_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  principalToken_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  principalToken_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  principalToken_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  principalToken_not?: InputMaybe$1<Scalars$1['Bytes']>;
  principalToken_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  principalToken_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  protocolAumFeeCache?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolAumFeeCache_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolAumFeeCache_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolAumFeeCache_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  protocolAumFeeCache_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolAumFeeCache_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolAumFeeCache_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolAumFeeCache_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  protocolId?: InputMaybe$1<Scalars$1['Int']>;
  protocolId_gt?: InputMaybe$1<Scalars$1['Int']>;
  protocolId_gte?: InputMaybe$1<Scalars$1['Int']>;
  protocolId_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  protocolId_lt?: InputMaybe$1<Scalars$1['Int']>;
  protocolId_lte?: InputMaybe$1<Scalars$1['Int']>;
  protocolId_not?: InputMaybe$1<Scalars$1['Int']>;
  protocolId_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  protocolSwapFeeCache?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolSwapFeeCache_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolSwapFeeCache_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolSwapFeeCache_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  protocolSwapFeeCache_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolSwapFeeCache_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolSwapFeeCache_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolSwapFeeCache_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  protocolYieldFeeCache?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolYieldFeeCache_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolYieldFeeCache_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolYieldFeeCache_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  protocolYieldFeeCache_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolYieldFeeCache_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolYieldFeeCache_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  protocolYieldFeeCache_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  root3Alpha?: InputMaybe$1<Scalars$1['BigDecimal']>;
  root3Alpha_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  root3Alpha_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  root3Alpha_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  root3Alpha_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  root3Alpha_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  root3Alpha_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  root3Alpha_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  s?: InputMaybe$1<Scalars$1['BigDecimal']>;
  s_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  s_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  s_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  s_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  s_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  s_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  s_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  shares_?: InputMaybe$1<PoolShare_Filter>;
  snapshots_?: InputMaybe$1<PoolSnapshot_Filter>;
  sqrtAlpha?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtAlpha_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtAlpha_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtAlpha_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  sqrtAlpha_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtAlpha_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtAlpha_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtAlpha_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  sqrtBeta?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtBeta_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtBeta_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtBeta_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  sqrtBeta_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtBeta_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtBeta_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  sqrtBeta_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  strategyType?: InputMaybe$1<Scalars$1['Int']>;
  strategyType_gt?: InputMaybe$1<Scalars$1['Int']>;
  strategyType_gte?: InputMaybe$1<Scalars$1['Int']>;
  strategyType_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  strategyType_lt?: InputMaybe$1<Scalars$1['Int']>;
  strategyType_lte?: InputMaybe$1<Scalars$1['Int']>;
  strategyType_not?: InputMaybe$1<Scalars$1['Int']>;
  strategyType_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  swapEnabled?: InputMaybe$1<Scalars$1['Boolean']>;
  swapEnabled_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  swapEnabled_not?: InputMaybe$1<Scalars$1['Boolean']>;
  swapEnabled_not_in?: InputMaybe$1<Array<Scalars$1['Boolean']>>;
  swapFee?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFee_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFee_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFee_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  swapFee_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFee_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFee_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  swapFee_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  swapsCount?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  swapsCount_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_not?: InputMaybe$1<Scalars$1['BigInt']>;
  swapsCount_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  swaps_?: InputMaybe$1<Swap_Filter>;
  symbol?: InputMaybe$1<Scalars$1['String']>;
  symbol_contains?: InputMaybe$1<Scalars$1['String']>;
  symbol_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_ends_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_gt?: InputMaybe$1<Scalars$1['String']>;
  symbol_gte?: InputMaybe$1<Scalars$1['String']>;
  symbol_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  symbol_lt?: InputMaybe$1<Scalars$1['String']>;
  symbol_lte?: InputMaybe$1<Scalars$1['String']>;
  symbol_not?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_contains?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  symbol_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_starts_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tauAlphaX?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaX_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaX_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaX_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tauAlphaX_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaX_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaX_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaX_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tauAlphaY?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaY_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaY_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaY_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tauAlphaY_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaY_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaY_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauAlphaY_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tauBetaX?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaX_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaX_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaX_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tauBetaX_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaX_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaX_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaX_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tauBetaY?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaY_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaY_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaY_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tauBetaY_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaY_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaY_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tauBetaY_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tokensList?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokensList_contains?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokensList_contains_nocase?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokensList_not?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokensList_not_contains?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokensList_not_contains_nocase?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokens_?: InputMaybe$1<PoolToken_Filter>;
  totalLiquidity?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalLiquidity_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalLiquidity_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalShares?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalShares_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalShares_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapFee?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapFee_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapFee_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapVolume?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapVolume_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalSwapVolume_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalWeight?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalWeight_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalWeight_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalWeight_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalWeight_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalWeight_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalWeight_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalWeight_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tx?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tx_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  u?: InputMaybe$1<Scalars$1['BigDecimal']>;
  u_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  u_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  u_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  u_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  u_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  u_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  u_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  unitSeconds?: InputMaybe$1<Scalars$1['BigInt']>;
  unitSeconds_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  unitSeconds_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  unitSeconds_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  unitSeconds_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  unitSeconds_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  unitSeconds_not?: InputMaybe$1<Scalars$1['BigInt']>;
  unitSeconds_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  upperTarget?: InputMaybe$1<Scalars$1['BigDecimal']>;
  upperTarget_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  upperTarget_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  upperTarget_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  upperTarget_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  upperTarget_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  upperTarget_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  upperTarget_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  v?: InputMaybe$1<Scalars$1['BigDecimal']>;
  v_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  v_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  v_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  v_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  v_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  v_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  v_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  vaultID?: InputMaybe$1<Scalars$1['String']>;
  vaultID_?: InputMaybe$1<Balancer_Filter>;
  vaultID_contains?: InputMaybe$1<Scalars$1['String']>;
  vaultID_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  vaultID_ends_with?: InputMaybe$1<Scalars$1['String']>;
  vaultID_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  vaultID_gt?: InputMaybe$1<Scalars$1['String']>;
  vaultID_gte?: InputMaybe$1<Scalars$1['String']>;
  vaultID_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  vaultID_lt?: InputMaybe$1<Scalars$1['String']>;
  vaultID_lte?: InputMaybe$1<Scalars$1['String']>;
  vaultID_not?: InputMaybe$1<Scalars$1['String']>;
  vaultID_not_contains?: InputMaybe$1<Scalars$1['String']>;
  vaultID_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  vaultID_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  vaultID_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  vaultID_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  vaultID_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  vaultID_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  vaultID_starts_with?: InputMaybe$1<Scalars$1['String']>;
  vaultID_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  w?: InputMaybe$1<Scalars$1['BigDecimal']>;
  w_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  w_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  w_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  w_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  w_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  w_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  w_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  weightUpdates_?: InputMaybe$1<GradualWeightUpdate_Filter>;
  wrappedIndex?: InputMaybe$1<Scalars$1['Int']>;
  wrappedIndex_gt?: InputMaybe$1<Scalars$1['Int']>;
  wrappedIndex_gte?: InputMaybe$1<Scalars$1['Int']>;
  wrappedIndex_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  wrappedIndex_lt?: InputMaybe$1<Scalars$1['Int']>;
  wrappedIndex_lte?: InputMaybe$1<Scalars$1['Int']>;
  wrappedIndex_not?: InputMaybe$1<Scalars$1['Int']>;
  wrappedIndex_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  z?: InputMaybe$1<Scalars$1['BigDecimal']>;
  z_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  z_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  z_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  z_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  z_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  z_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  z_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
};
declare enum Pool_OrderBy$1 {
  Address = 'address',
  Alpha = 'alpha',
  Amp = 'amp',
  BaseToken = 'baseToken',
  Beta = 'beta',
  C = 'c',
  CreateTime = 'createTime',
  DSq = 'dSq',
  Delta = 'delta',
  Epsilon = 'epsilon',
  ExpiryTime = 'expiryTime',
  Factory = 'factory',
  HistoricalValues = 'historicalValues',
  HoldersCount = 'holdersCount',
  Id = 'id',
  IsInRecoveryMode = 'isInRecoveryMode',
  IsPaused = 'isPaused',
  Lambda = 'lambda',
  LowerTarget = 'lowerTarget',
  MainIndex = 'mainIndex',
  ManagementFee = 'managementFee',
  Name = 'name',
  OracleEnabled = 'oracleEnabled',
  Owner = 'owner',
  PoolType = 'poolType',
  PoolTypeVersion = 'poolTypeVersion',
  PriceRateProviders = 'priceRateProviders',
  PrincipalToken = 'principalToken',
  ProtocolAumFeeCache = 'protocolAumFeeCache',
  ProtocolId = 'protocolId',
  ProtocolSwapFeeCache = 'protocolSwapFeeCache',
  ProtocolYieldFeeCache = 'protocolYieldFeeCache',
  Root3Alpha = 'root3Alpha',
  S = 's',
  Shares = 'shares',
  Snapshots = 'snapshots',
  SqrtAlpha = 'sqrtAlpha',
  SqrtBeta = 'sqrtBeta',
  StrategyType = 'strategyType',
  SwapEnabled = 'swapEnabled',
  SwapFee = 'swapFee',
  Swaps = 'swaps',
  SwapsCount = 'swapsCount',
  Symbol = 'symbol',
  TauAlphaX = 'tauAlphaX',
  TauAlphaY = 'tauAlphaY',
  TauBetaX = 'tauBetaX',
  TauBetaY = 'tauBetaY',
  Tokens = 'tokens',
  TokensList = 'tokensList',
  TotalLiquidity = 'totalLiquidity',
  TotalShares = 'totalShares',
  TotalSwapFee = 'totalSwapFee',
  TotalSwapVolume = 'totalSwapVolume',
  TotalWeight = 'totalWeight',
  Tx = 'tx',
  U = 'u',
  UnitSeconds = 'unitSeconds',
  UpperTarget = 'upperTarget',
  V = 'v',
  VaultId = 'vaultID',
  VaultIdId = 'vaultID__id',
  VaultIdPoolCount = 'vaultID__poolCount',
  VaultIdTotalLiquidity = 'vaultID__totalLiquidity',
  VaultIdTotalSwapCount = 'vaultID__totalSwapCount',
  VaultIdTotalSwapFee = 'vaultID__totalSwapFee',
  VaultIdTotalSwapVolume = 'vaultID__totalSwapVolume',
  W = 'w',
  WeightUpdates = 'weightUpdates',
  WrappedIndex = 'wrappedIndex',
  Z = 'z',
}
type PriceRateProvider_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  address?: InputMaybe$1<Scalars$1['Bytes']>;
  address_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  address_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  address_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  address_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  address_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  address_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  address_not?: InputMaybe$1<Scalars$1['Bytes']>;
  address_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  address_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  and?: InputMaybe$1<Array<InputMaybe$1<PriceRateProvider_Filter>>>;
  cacheDuration?: InputMaybe$1<Scalars$1['Int']>;
  cacheDuration_gt?: InputMaybe$1<Scalars$1['Int']>;
  cacheDuration_gte?: InputMaybe$1<Scalars$1['Int']>;
  cacheDuration_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  cacheDuration_lt?: InputMaybe$1<Scalars$1['Int']>;
  cacheDuration_lte?: InputMaybe$1<Scalars$1['Int']>;
  cacheDuration_not?: InputMaybe$1<Scalars$1['Int']>;
  cacheDuration_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  cacheExpiry?: InputMaybe$1<Scalars$1['Int']>;
  cacheExpiry_gt?: InputMaybe$1<Scalars$1['Int']>;
  cacheExpiry_gte?: InputMaybe$1<Scalars$1['Int']>;
  cacheExpiry_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  cacheExpiry_lt?: InputMaybe$1<Scalars$1['Int']>;
  cacheExpiry_lte?: InputMaybe$1<Scalars$1['Int']>;
  cacheExpiry_not?: InputMaybe$1<Scalars$1['Int']>;
  cacheExpiry_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  lastCached?: InputMaybe$1<Scalars$1['Int']>;
  lastCached_gt?: InputMaybe$1<Scalars$1['Int']>;
  lastCached_gte?: InputMaybe$1<Scalars$1['Int']>;
  lastCached_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  lastCached_lt?: InputMaybe$1<Scalars$1['Int']>;
  lastCached_lte?: InputMaybe$1<Scalars$1['Int']>;
  lastCached_not?: InputMaybe$1<Scalars$1['Int']>;
  lastCached_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<PriceRateProvider_Filter>>>;
  poolId?: InputMaybe$1<Scalars$1['String']>;
  poolId_?: InputMaybe$1<Pool_Filter$1>;
  poolId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolId_not?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  rate?: InputMaybe$1<Scalars$1['BigDecimal']>;
  rate_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  rate_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  rate_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  rate_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  rate_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  rate_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  rate_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  token?: InputMaybe$1<Scalars$1['String']>;
  token_?: InputMaybe$1<PoolToken_Filter>;
  token_contains?: InputMaybe$1<Scalars$1['String']>;
  token_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_ends_with?: InputMaybe$1<Scalars$1['String']>;
  token_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_gt?: InputMaybe$1<Scalars$1['String']>;
  token_gte?: InputMaybe$1<Scalars$1['String']>;
  token_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  token_lt?: InputMaybe$1<Scalars$1['String']>;
  token_lte?: InputMaybe$1<Scalars$1['String']>;
  token_not?: InputMaybe$1<Scalars$1['String']>;
  token_not_contains?: InputMaybe$1<Scalars$1['String']>;
  token_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  token_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  token_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  token_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  token_starts_with?: InputMaybe$1<Scalars$1['String']>;
  token_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
};
type Swap_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<Swap_Filter>>>;
  caller?: InputMaybe$1<Scalars$1['Bytes']>;
  caller_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  caller_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  caller_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  caller_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  caller_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  caller_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  caller_not?: InputMaybe$1<Scalars$1['Bytes']>;
  caller_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  caller_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<Swap_Filter>>>;
  poolId?: InputMaybe$1<Scalars$1['String']>;
  poolId_?: InputMaybe$1<Pool_Filter$1>;
  poolId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolId_not?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  timestamp?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  timestamp_lt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_lte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  tokenAmountIn?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountIn_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountIn_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountIn_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tokenAmountIn_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountIn_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountIn_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountIn_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tokenAmountOut?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountOut_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountOut_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountOut_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tokenAmountOut_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountOut_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountOut_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  tokenAmountOut_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  tokenIn?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenInSym?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_contains?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_ends_with?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_gt?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_gte?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  tokenInSym_lt?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_lte?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_not?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_not_contains?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  tokenInSym_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_starts_with?: InputMaybe$1<Scalars$1['String']>;
  tokenInSym_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenIn_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenIn_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenIn_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenIn_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokenIn_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenIn_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenIn_not?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenIn_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenIn_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokenOut?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenOutSym?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_contains?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_ends_with?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_gt?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_gte?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  tokenOutSym_lt?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_lte?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_not?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_not_contains?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  tokenOutSym_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_starts_with?: InputMaybe$1<Scalars$1['String']>;
  tokenOutSym_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  tokenOut_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenOut_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenOut_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenOut_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tokenOut_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenOut_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenOut_not?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenOut_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tokenOut_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tx?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  tx_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  tx_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  userAddress?: InputMaybe$1<Scalars$1['String']>;
  userAddress_?: InputMaybe$1<User_Filter$1>;
  userAddress_contains?: InputMaybe$1<Scalars$1['String']>;
  userAddress_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_ends_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_gt?: InputMaybe$1<Scalars$1['String']>;
  userAddress_gte?: InputMaybe$1<Scalars$1['String']>;
  userAddress_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  userAddress_lt?: InputMaybe$1<Scalars$1['String']>;
  userAddress_lte?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_contains?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  userAddress_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_starts_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  valueUSD?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  valueUSD_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  valueUSD_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
};
type TokenPrice_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  amount?: InputMaybe$1<Scalars$1['BigDecimal']>;
  amount_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  amount_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  amount_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  amount_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  amount_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  amount_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  amount_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  and?: InputMaybe$1<Array<InputMaybe$1<TokenPrice_Filter>>>;
  asset?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  asset_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_not?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  asset_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  block?: InputMaybe$1<Scalars$1['BigInt']>;
  block_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  block_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  block_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  block_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  block_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  block_not?: InputMaybe$1<Scalars$1['BigInt']>;
  block_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<TokenPrice_Filter>>>;
  poolId?: InputMaybe$1<Scalars$1['String']>;
  poolId_?: InputMaybe$1<Pool_Filter$1>;
  poolId_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_gt?: InputMaybe$1<Scalars$1['String']>;
  poolId_gte?: InputMaybe$1<Scalars$1['String']>;
  poolId_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_lt?: InputMaybe$1<Scalars$1['String']>;
  poolId_lte?: InputMaybe$1<Scalars$1['String']>;
  poolId_not?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  poolId_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with?: InputMaybe$1<Scalars$1['String']>;
  poolId_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  price?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  price_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  price_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  pricingAsset?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  pricingAsset_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  pricingAsset_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  timestamp?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_gte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  timestamp_lt?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_lte?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not?: InputMaybe$1<Scalars$1['Int']>;
  timestamp_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
};
declare enum TokenPrice_OrderBy {
  Amount = 'amount',
  Asset = 'asset',
  Block = 'block',
  Id = 'id',
  PoolId = 'poolId',
  PoolIdAddress = 'poolId__address',
  PoolIdAlpha = 'poolId__alpha',
  PoolIdAmp = 'poolId__amp',
  PoolIdBaseToken = 'poolId__baseToken',
  PoolIdBeta = 'poolId__beta',
  PoolIdC = 'poolId__c',
  PoolIdCreateTime = 'poolId__createTime',
  PoolIdDSq = 'poolId__dSq',
  PoolIdDelta = 'poolId__delta',
  PoolIdEpsilon = 'poolId__epsilon',
  PoolIdExpiryTime = 'poolId__expiryTime',
  PoolIdFactory = 'poolId__factory',
  PoolIdHoldersCount = 'poolId__holdersCount',
  PoolIdId = 'poolId__id',
  PoolIdIsInRecoveryMode = 'poolId__isInRecoveryMode',
  PoolIdIsPaused = 'poolId__isPaused',
  PoolIdLambda = 'poolId__lambda',
  PoolIdLowerTarget = 'poolId__lowerTarget',
  PoolIdMainIndex = 'poolId__mainIndex',
  PoolIdManagementFee = 'poolId__managementFee',
  PoolIdName = 'poolId__name',
  PoolIdOracleEnabled = 'poolId__oracleEnabled',
  PoolIdOwner = 'poolId__owner',
  PoolIdPoolType = 'poolId__poolType',
  PoolIdPoolTypeVersion = 'poolId__poolTypeVersion',
  PoolIdPrincipalToken = 'poolId__principalToken',
  PoolIdProtocolAumFeeCache = 'poolId__protocolAumFeeCache',
  PoolIdProtocolId = 'poolId__protocolId',
  PoolIdProtocolSwapFeeCache = 'poolId__protocolSwapFeeCache',
  PoolIdProtocolYieldFeeCache = 'poolId__protocolYieldFeeCache',
  PoolIdRoot3Alpha = 'poolId__root3Alpha',
  PoolIdS = 'poolId__s',
  PoolIdSqrtAlpha = 'poolId__sqrtAlpha',
  PoolIdSqrtBeta = 'poolId__sqrtBeta',
  PoolIdStrategyType = 'poolId__strategyType',
  PoolIdSwapEnabled = 'poolId__swapEnabled',
  PoolIdSwapFee = 'poolId__swapFee',
  PoolIdSwapsCount = 'poolId__swapsCount',
  PoolIdSymbol = 'poolId__symbol',
  PoolIdTauAlphaX = 'poolId__tauAlphaX',
  PoolIdTauAlphaY = 'poolId__tauAlphaY',
  PoolIdTauBetaX = 'poolId__tauBetaX',
  PoolIdTauBetaY = 'poolId__tauBetaY',
  PoolIdTotalLiquidity = 'poolId__totalLiquidity',
  PoolIdTotalShares = 'poolId__totalShares',
  PoolIdTotalSwapFee = 'poolId__totalSwapFee',
  PoolIdTotalSwapVolume = 'poolId__totalSwapVolume',
  PoolIdTotalWeight = 'poolId__totalWeight',
  PoolIdTx = 'poolId__tx',
  PoolIdU = 'poolId__u',
  PoolIdUnitSeconds = 'poolId__unitSeconds',
  PoolIdUpperTarget = 'poolId__upperTarget',
  PoolIdV = 'poolId__v',
  PoolIdW = 'poolId__w',
  PoolIdWrappedIndex = 'poolId__wrappedIndex',
  PoolIdZ = 'poolId__z',
  Price = 'price',
  PricingAsset = 'pricingAsset',
  Timestamp = 'timestamp',
}
type Token_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  address?: InputMaybe$1<Scalars$1['String']>;
  address_contains?: InputMaybe$1<Scalars$1['String']>;
  address_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_ends_with?: InputMaybe$1<Scalars$1['String']>;
  address_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_gt?: InputMaybe$1<Scalars$1['String']>;
  address_gte?: InputMaybe$1<Scalars$1['String']>;
  address_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  address_lt?: InputMaybe$1<Scalars$1['String']>;
  address_lte?: InputMaybe$1<Scalars$1['String']>;
  address_not?: InputMaybe$1<Scalars$1['String']>;
  address_not_contains?: InputMaybe$1<Scalars$1['String']>;
  address_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  address_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  address_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  address_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  address_starts_with?: InputMaybe$1<Scalars$1['String']>;
  address_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  and?: InputMaybe$1<Array<InputMaybe$1<Token_Filter>>>;
  decimals?: InputMaybe$1<Scalars$1['Int']>;
  decimals_gt?: InputMaybe$1<Scalars$1['Int']>;
  decimals_gte?: InputMaybe$1<Scalars$1['Int']>;
  decimals_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  decimals_lt?: InputMaybe$1<Scalars$1['Int']>;
  decimals_lte?: InputMaybe$1<Scalars$1['Int']>;
  decimals_not?: InputMaybe$1<Scalars$1['Int']>;
  decimals_not_in?: InputMaybe$1<Array<Scalars$1['Int']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  latestFXPrice?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestFXPrice_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestFXPrice_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestFXPrice_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  latestFXPrice_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestFXPrice_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestFXPrice_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestFXPrice_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  latestPrice?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_?: InputMaybe$1<LatestPrice_Filter>;
  latestPrice_contains?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_ends_with?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_gt?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_gte?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  latestPrice_lt?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_lte?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_not?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_not_contains?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  latestPrice_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_starts_with?: InputMaybe$1<Scalars$1['String']>;
  latestPrice_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  latestUSDPrice?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestUSDPrice_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestUSDPrice_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestUSDPrice_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  latestUSDPrice_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestUSDPrice_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestUSDPrice_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  latestUSDPrice_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  name?: InputMaybe$1<Scalars$1['String']>;
  name_contains?: InputMaybe$1<Scalars$1['String']>;
  name_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_ends_with?: InputMaybe$1<Scalars$1['String']>;
  name_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_gt?: InputMaybe$1<Scalars$1['String']>;
  name_gte?: InputMaybe$1<Scalars$1['String']>;
  name_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  name_lt?: InputMaybe$1<Scalars$1['String']>;
  name_lte?: InputMaybe$1<Scalars$1['String']>;
  name_not?: InputMaybe$1<Scalars$1['String']>;
  name_not_contains?: InputMaybe$1<Scalars$1['String']>;
  name_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  name_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  name_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  name_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  name_starts_with?: InputMaybe$1<Scalars$1['String']>;
  name_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  or?: InputMaybe$1<Array<InputMaybe$1<Token_Filter>>>;
  pool?: InputMaybe$1<Scalars$1['String']>;
  pool_?: InputMaybe$1<Pool_Filter$1>;
  pool_contains?: InputMaybe$1<Scalars$1['String']>;
  pool_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_ends_with?: InputMaybe$1<Scalars$1['String']>;
  pool_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_gt?: InputMaybe$1<Scalars$1['String']>;
  pool_gte?: InputMaybe$1<Scalars$1['String']>;
  pool_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  pool_lt?: InputMaybe$1<Scalars$1['String']>;
  pool_lte?: InputMaybe$1<Scalars$1['String']>;
  pool_not?: InputMaybe$1<Scalars$1['String']>;
  pool_not_contains?: InputMaybe$1<Scalars$1['String']>;
  pool_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  pool_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  pool_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  pool_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  pool_starts_with?: InputMaybe$1<Scalars$1['String']>;
  pool_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol?: InputMaybe$1<Scalars$1['String']>;
  symbol_contains?: InputMaybe$1<Scalars$1['String']>;
  symbol_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_ends_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_gt?: InputMaybe$1<Scalars$1['String']>;
  symbol_gte?: InputMaybe$1<Scalars$1['String']>;
  symbol_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  symbol_lt?: InputMaybe$1<Scalars$1['String']>;
  symbol_lte?: InputMaybe$1<Scalars$1['String']>;
  symbol_not?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_contains?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  symbol_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  symbol_starts_with?: InputMaybe$1<Scalars$1['String']>;
  symbol_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  totalBalanceNotional?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceNotional_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceNotional_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceNotional_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalBalanceNotional_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceNotional_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceNotional_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceNotional_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalBalanceUSD?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceUSD_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceUSD_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceUSD_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalBalanceUSD_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceUSD_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceUSD_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalBalanceUSD_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalSwapCount?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_gt?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_gte?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  totalSwapCount_lt?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_lte?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_not?: InputMaybe$1<Scalars$1['BigInt']>;
  totalSwapCount_not_in?: InputMaybe$1<Array<Scalars$1['BigInt']>>;
  totalVolumeNotional?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeNotional_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeNotional_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeNotional_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalVolumeNotional_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeNotional_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeNotional_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeNotional_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalVolumeUSD?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeUSD_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeUSD_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeUSD_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  totalVolumeUSD_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeUSD_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeUSD_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  totalVolumeUSD_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
};
type UserInternalBalance_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<UserInternalBalance_Filter>>>;
  balance?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_gt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_gte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  balance_lt?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_lte?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_not?: InputMaybe$1<Scalars$1['BigDecimal']>;
  balance_not_in?: InputMaybe$1<Array<Scalars$1['BigDecimal']>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<UserInternalBalance_Filter>>>;
  token?: InputMaybe$1<Scalars$1['Bytes']>;
  token_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  token_gt?: InputMaybe$1<Scalars$1['Bytes']>;
  token_gte?: InputMaybe$1<Scalars$1['Bytes']>;
  token_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  token_lt?: InputMaybe$1<Scalars$1['Bytes']>;
  token_lte?: InputMaybe$1<Scalars$1['Bytes']>;
  token_not?: InputMaybe$1<Scalars$1['Bytes']>;
  token_not_contains?: InputMaybe$1<Scalars$1['Bytes']>;
  token_not_in?: InputMaybe$1<Array<Scalars$1['Bytes']>>;
  userAddress?: InputMaybe$1<Scalars$1['String']>;
  userAddress_?: InputMaybe$1<User_Filter$1>;
  userAddress_contains?: InputMaybe$1<Scalars$1['String']>;
  userAddress_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_ends_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_gt?: InputMaybe$1<Scalars$1['String']>;
  userAddress_gte?: InputMaybe$1<Scalars$1['String']>;
  userAddress_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  userAddress_lt?: InputMaybe$1<Scalars$1['String']>;
  userAddress_lte?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_contains?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_contains_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_ends_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_ends_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_in?: InputMaybe$1<Array<Scalars$1['String']>>;
  userAddress_not_starts_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_not_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
  userAddress_starts_with?: InputMaybe$1<Scalars$1['String']>;
  userAddress_starts_with_nocase?: InputMaybe$1<Scalars$1['String']>;
};
type User_Filter$1 = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe$1<BlockChangedFilter$1>;
  and?: InputMaybe$1<Array<InputMaybe$1<User_Filter$1>>>;
  id?: InputMaybe$1<Scalars$1['ID']>;
  id_gt?: InputMaybe$1<Scalars$1['ID']>;
  id_gte?: InputMaybe$1<Scalars$1['ID']>;
  id_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  id_lt?: InputMaybe$1<Scalars$1['ID']>;
  id_lte?: InputMaybe$1<Scalars$1['ID']>;
  id_not?: InputMaybe$1<Scalars$1['ID']>;
  id_not_in?: InputMaybe$1<Array<Scalars$1['ID']>>;
  or?: InputMaybe$1<Array<InputMaybe$1<User_Filter$1>>>;
  sharesOwned_?: InputMaybe$1<PoolShare_Filter>;
  swaps_?: InputMaybe$1<Swap_Filter>;
  userInternalBalances_?: InputMaybe$1<UserInternalBalance_Filter>;
};
declare enum User_OrderBy {
  Id = 'id',
  SharesOwned = 'sharesOwned',
  Swaps = 'swaps',
  UserInternalBalances = 'userInternalBalances',
}
type PoolShareQueryVariables = Exact$1<{
  id: Scalars$1['ID'];
  block?: InputMaybe$1<Block_Height$1>;
}>;
type PoolShareQuery = {
  __typename?: 'Query';
  poolShare?: {
    __typename?: 'PoolShare';
    id: string;
    balance: string;
    userAddress: {
      __typename?: 'User';
      id: string;
    };
    poolId: {
      __typename?: 'Pool';
      id: string;
      address: string;
    };
  } | null;
};
type PoolSharesQueryVariables = Exact$1<{
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<PoolShare_OrderBy>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  skip?: InputMaybe$1<Scalars$1['Int']>;
  where?: InputMaybe$1<PoolShare_Filter>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type PoolSharesQuery = {
  __typename?: 'Query';
  poolShares: Array<{
    __typename?: 'PoolShare';
    id: string;
    balance: string;
    userAddress: {
      __typename?: 'User';
      id: string;
    };
    poolId: {
      __typename?: 'Pool';
      id: string;
      address: string;
    };
  }>;
};
type SubgraphPoolShareFragment = {
  __typename?: 'PoolShare';
  id: string;
  balance: string;
  userAddress: {
    __typename?: 'User';
    id: string;
  };
  poolId: {
    __typename?: 'Pool';
    id: string;
    address: string;
  };
};
type PoolsQueryVariables$1 = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<Pool_OrderBy$1>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<Pool_Filter$1>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type PoolsQuery$1 = {
  __typename?: 'Query';
  pools: Array<{
    __typename?: 'Pool';
    id: string;
    address: string;
    poolType?: string | null;
    poolTypeVersion?: number | null;
    factory?: string | null;
    strategyType: number;
    symbol?: string | null;
    name?: string | null;
    swapEnabled: boolean;
    swapFee: string;
    protocolYieldFeeCache?: string | null;
    protocolSwapFeeCache?: string | null;
    owner?: string | null;
    totalWeight?: string | null;
    totalSwapVolume: string;
    totalSwapFee: string;
    totalLiquidity: string;
    totalShares: string;
    swapsCount: string;
    holdersCount: string;
    tokensList: Array<string>;
    amp?: string | null;
    expiryTime?: string | null;
    unitSeconds?: string | null;
    createTime: number;
    principalToken?: string | null;
    baseToken?: string | null;
    wrappedIndex?: number | null;
    mainIndex?: number | null;
    lowerTarget?: string | null;
    upperTarget?: string | null;
    sqrtAlpha?: string | null;
    sqrtBeta?: string | null;
    root3Alpha?: string | null;
    tokens?: Array<{
      __typename?: 'PoolToken';
      id: string;
      symbol: string;
      name: string;
      decimals: number;
      address: string;
      balance: string;
      managedBalance: string;
      weight?: string | null;
      priceRate: string;
      isExemptFromYieldProtocolFee?: boolean | null;
      token: {
        __typename?: 'Token';
        latestUSDPrice?: string | null;
        pool?: {
          __typename?: 'Pool';
          id: string;
          totalShares: string;
          address: string;
          poolType?: string | null;
          mainIndex?: number | null;
          tokens?: Array<{
            __typename?: 'PoolToken';
            address: string;
            balance: string;
            weight?: string | null;
            priceRate: string;
            symbol: string;
            decimals: number;
            isExemptFromYieldProtocolFee?: boolean | null;
            token: {
              __typename?: 'Token';
              latestUSDPrice?: string | null;
              pool?: {
                __typename?: 'Pool';
                id: string;
                totalShares: string;
                address: string;
                poolType?: string | null;
                mainIndex?: number | null;
                tokens?: Array<{
                  __typename?: 'PoolToken';
                  address: string;
                  balance: string;
                  weight?: string | null;
                  priceRate: string;
                  symbol: string;
                  decimals: number;
                  isExemptFromYieldProtocolFee?: boolean | null;
                  token: {
                    __typename?: 'Token';
                    latestUSDPrice?: string | null;
                    pool?: {
                      __typename?: 'Pool';
                      id: string;
                      totalShares: string;
                      address: string;
                      poolType?: string | null;
                      mainIndex?: number | null;
                    } | null;
                  };
                }> | null;
              } | null;
            };
          }> | null;
        } | null;
      };
    }> | null;
    priceRateProviders?: Array<{
      __typename?: 'PriceRateProvider';
      address: string;
      token: {
        __typename?: 'PoolToken';
        address: string;
      };
    }> | null;
  }>;
};
type AllPoolsQueryVariables = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<Pool_OrderBy$1>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<Pool_Filter$1>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type AllPoolsQuery = {
  __typename?: 'Query';
  pool0: Array<{
    __typename?: 'Pool';
    id: string;
    address: string;
    poolType?: string | null;
    poolTypeVersion?: number | null;
    factory?: string | null;
    strategyType: number;
    symbol?: string | null;
    name?: string | null;
    swapEnabled: boolean;
    swapFee: string;
    protocolYieldFeeCache?: string | null;
    protocolSwapFeeCache?: string | null;
    owner?: string | null;
    totalWeight?: string | null;
    totalSwapVolume: string;
    totalSwapFee: string;
    totalLiquidity: string;
    totalShares: string;
    swapsCount: string;
    holdersCount: string;
    tokensList: Array<string>;
    amp?: string | null;
    expiryTime?: string | null;
    unitSeconds?: string | null;
    createTime: number;
    principalToken?: string | null;
    baseToken?: string | null;
    wrappedIndex?: number | null;
    mainIndex?: number | null;
    lowerTarget?: string | null;
    upperTarget?: string | null;
    sqrtAlpha?: string | null;
    sqrtBeta?: string | null;
    root3Alpha?: string | null;
    tokens?: Array<{
      __typename?: 'PoolToken';
      id: string;
      symbol: string;
      name: string;
      decimals: number;
      address: string;
      balance: string;
      managedBalance: string;
      weight?: string | null;
      priceRate: string;
      isExemptFromYieldProtocolFee?: boolean | null;
      token: {
        __typename?: 'Token';
        latestUSDPrice?: string | null;
        pool?: {
          __typename?: 'Pool';
          id: string;
          totalShares: string;
          address: string;
          poolType?: string | null;
          mainIndex?: number | null;
          tokens?: Array<{
            __typename?: 'PoolToken';
            address: string;
            balance: string;
            weight?: string | null;
            priceRate: string;
            symbol: string;
            decimals: number;
            isExemptFromYieldProtocolFee?: boolean | null;
            token: {
              __typename?: 'Token';
              latestUSDPrice?: string | null;
              pool?: {
                __typename?: 'Pool';
                id: string;
                totalShares: string;
                address: string;
                poolType?: string | null;
                mainIndex?: number | null;
                tokens?: Array<{
                  __typename?: 'PoolToken';
                  address: string;
                  balance: string;
                  weight?: string | null;
                  priceRate: string;
                  symbol: string;
                  decimals: number;
                  isExemptFromYieldProtocolFee?: boolean | null;
                  token: {
                    __typename?: 'Token';
                    latestUSDPrice?: string | null;
                    pool?: {
                      __typename?: 'Pool';
                      id: string;
                      totalShares: string;
                      address: string;
                      poolType?: string | null;
                      mainIndex?: number | null;
                    } | null;
                  };
                }> | null;
              } | null;
            };
          }> | null;
        } | null;
      };
    }> | null;
    priceRateProviders?: Array<{
      __typename?: 'PriceRateProvider';
      address: string;
      token: {
        __typename?: 'PoolToken';
        address: string;
      };
    }> | null;
  }>;
  pool1000: Array<{
    __typename?: 'Pool';
    id: string;
    address: string;
    poolType?: string | null;
    poolTypeVersion?: number | null;
    factory?: string | null;
    strategyType: number;
    symbol?: string | null;
    name?: string | null;
    swapEnabled: boolean;
    swapFee: string;
    protocolYieldFeeCache?: string | null;
    protocolSwapFeeCache?: string | null;
    owner?: string | null;
    totalWeight?: string | null;
    totalSwapVolume: string;
    totalSwapFee: string;
    totalLiquidity: string;
    totalShares: string;
    swapsCount: string;
    holdersCount: string;
    tokensList: Array<string>;
    amp?: string | null;
    expiryTime?: string | null;
    unitSeconds?: string | null;
    createTime: number;
    principalToken?: string | null;
    baseToken?: string | null;
    wrappedIndex?: number | null;
    mainIndex?: number | null;
    lowerTarget?: string | null;
    upperTarget?: string | null;
    sqrtAlpha?: string | null;
    sqrtBeta?: string | null;
    root3Alpha?: string | null;
    tokens?: Array<{
      __typename?: 'PoolToken';
      id: string;
      symbol: string;
      name: string;
      decimals: number;
      address: string;
      balance: string;
      managedBalance: string;
      weight?: string | null;
      priceRate: string;
      isExemptFromYieldProtocolFee?: boolean | null;
      token: {
        __typename?: 'Token';
        latestUSDPrice?: string | null;
        pool?: {
          __typename?: 'Pool';
          id: string;
          totalShares: string;
          address: string;
          poolType?: string | null;
          mainIndex?: number | null;
          tokens?: Array<{
            __typename?: 'PoolToken';
            address: string;
            balance: string;
            weight?: string | null;
            priceRate: string;
            symbol: string;
            decimals: number;
            isExemptFromYieldProtocolFee?: boolean | null;
            token: {
              __typename?: 'Token';
              latestUSDPrice?: string | null;
              pool?: {
                __typename?: 'Pool';
                id: string;
                totalShares: string;
                address: string;
                poolType?: string | null;
                mainIndex?: number | null;
                tokens?: Array<{
                  __typename?: 'PoolToken';
                  address: string;
                  balance: string;
                  weight?: string | null;
                  priceRate: string;
                  symbol: string;
                  decimals: number;
                  isExemptFromYieldProtocolFee?: boolean | null;
                  token: {
                    __typename?: 'Token';
                    latestUSDPrice?: string | null;
                    pool?: {
                      __typename?: 'Pool';
                      id: string;
                      totalShares: string;
                      address: string;
                      poolType?: string | null;
                      mainIndex?: number | null;
                    } | null;
                  };
                }> | null;
              } | null;
            };
          }> | null;
        } | null;
      };
    }> | null;
    priceRateProviders?: Array<{
      __typename?: 'PriceRateProvider';
      address: string;
      token: {
        __typename?: 'PoolToken';
        address: string;
      };
    }> | null;
  }>;
  pool2000: Array<{
    __typename?: 'Pool';
    id: string;
    address: string;
    poolType?: string | null;
    poolTypeVersion?: number | null;
    factory?: string | null;
    strategyType: number;
    symbol?: string | null;
    name?: string | null;
    swapEnabled: boolean;
    swapFee: string;
    protocolYieldFeeCache?: string | null;
    protocolSwapFeeCache?: string | null;
    owner?: string | null;
    totalWeight?: string | null;
    totalSwapVolume: string;
    totalSwapFee: string;
    totalLiquidity: string;
    totalShares: string;
    swapsCount: string;
    holdersCount: string;
    tokensList: Array<string>;
    amp?: string | null;
    expiryTime?: string | null;
    unitSeconds?: string | null;
    createTime: number;
    principalToken?: string | null;
    baseToken?: string | null;
    wrappedIndex?: number | null;
    mainIndex?: number | null;
    lowerTarget?: string | null;
    upperTarget?: string | null;
    sqrtAlpha?: string | null;
    sqrtBeta?: string | null;
    root3Alpha?: string | null;
    tokens?: Array<{
      __typename?: 'PoolToken';
      id: string;
      symbol: string;
      name: string;
      decimals: number;
      address: string;
      balance: string;
      managedBalance: string;
      weight?: string | null;
      priceRate: string;
      isExemptFromYieldProtocolFee?: boolean | null;
      token: {
        __typename?: 'Token';
        latestUSDPrice?: string | null;
        pool?: {
          __typename?: 'Pool';
          id: string;
          totalShares: string;
          address: string;
          poolType?: string | null;
          mainIndex?: number | null;
          tokens?: Array<{
            __typename?: 'PoolToken';
            address: string;
            balance: string;
            weight?: string | null;
            priceRate: string;
            symbol: string;
            decimals: number;
            isExemptFromYieldProtocolFee?: boolean | null;
            token: {
              __typename?: 'Token';
              latestUSDPrice?: string | null;
              pool?: {
                __typename?: 'Pool';
                id: string;
                totalShares: string;
                address: string;
                poolType?: string | null;
                mainIndex?: number | null;
                tokens?: Array<{
                  __typename?: 'PoolToken';
                  address: string;
                  balance: string;
                  weight?: string | null;
                  priceRate: string;
                  symbol: string;
                  decimals: number;
                  isExemptFromYieldProtocolFee?: boolean | null;
                  token: {
                    __typename?: 'Token';
                    latestUSDPrice?: string | null;
                    pool?: {
                      __typename?: 'Pool';
                      id: string;
                      totalShares: string;
                      address: string;
                      poolType?: string | null;
                      mainIndex?: number | null;
                    } | null;
                  };
                }> | null;
              } | null;
            };
          }> | null;
        } | null;
      };
    }> | null;
    priceRateProviders?: Array<{
      __typename?: 'PriceRateProvider';
      address: string;
      token: {
        __typename?: 'PoolToken';
        address: string;
      };
    }> | null;
  }>;
};
type PoolQueryVariables = Exact$1<{
  id: Scalars$1['ID'];
  block?: InputMaybe$1<Block_Height$1>;
}>;
type PoolQuery = {
  __typename?: 'Query';
  pool?: {
    __typename?: 'Pool';
    id: string;
    address: string;
    poolType?: string | null;
    poolTypeVersion?: number | null;
    factory?: string | null;
    strategyType: number;
    symbol?: string | null;
    name?: string | null;
    swapEnabled: boolean;
    swapFee: string;
    protocolYieldFeeCache?: string | null;
    protocolSwapFeeCache?: string | null;
    owner?: string | null;
    totalWeight?: string | null;
    totalSwapVolume: string;
    totalSwapFee: string;
    totalLiquidity: string;
    totalShares: string;
    swapsCount: string;
    holdersCount: string;
    tokensList: Array<string>;
    amp?: string | null;
    expiryTime?: string | null;
    unitSeconds?: string | null;
    createTime: number;
    principalToken?: string | null;
    baseToken?: string | null;
    wrappedIndex?: number | null;
    mainIndex?: number | null;
    lowerTarget?: string | null;
    upperTarget?: string | null;
    sqrtAlpha?: string | null;
    sqrtBeta?: string | null;
    root3Alpha?: string | null;
    tokens?: Array<{
      __typename?: 'PoolToken';
      id: string;
      symbol: string;
      name: string;
      decimals: number;
      address: string;
      balance: string;
      managedBalance: string;
      weight?: string | null;
      priceRate: string;
      isExemptFromYieldProtocolFee?: boolean | null;
      token: {
        __typename?: 'Token';
        latestUSDPrice?: string | null;
        pool?: {
          __typename?: 'Pool';
          id: string;
          totalShares: string;
          address: string;
          poolType?: string | null;
          mainIndex?: number | null;
          tokens?: Array<{
            __typename?: 'PoolToken';
            address: string;
            balance: string;
            weight?: string | null;
            priceRate: string;
            symbol: string;
            decimals: number;
            isExemptFromYieldProtocolFee?: boolean | null;
            token: {
              __typename?: 'Token';
              latestUSDPrice?: string | null;
              pool?: {
                __typename?: 'Pool';
                id: string;
                totalShares: string;
                address: string;
                poolType?: string | null;
                mainIndex?: number | null;
                tokens?: Array<{
                  __typename?: 'PoolToken';
                  address: string;
                  balance: string;
                  weight?: string | null;
                  priceRate: string;
                  symbol: string;
                  decimals: number;
                  isExemptFromYieldProtocolFee?: boolean | null;
                  token: {
                    __typename?: 'Token';
                    latestUSDPrice?: string | null;
                    pool?: {
                      __typename?: 'Pool';
                      id: string;
                      totalShares: string;
                      address: string;
                      poolType?: string | null;
                      mainIndex?: number | null;
                    } | null;
                  };
                }> | null;
              } | null;
            };
          }> | null;
        } | null;
      };
    }> | null;
    priceRateProviders?: Array<{
      __typename?: 'PriceRateProvider';
      address: string;
      token: {
        __typename?: 'PoolToken';
        address: string;
      };
    }> | null;
  } | null;
};
type PoolHistoricalLiquiditiesQueryVariables = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<PoolHistoricalLiquidity_OrderBy>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<PoolHistoricalLiquidity_Filter>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type PoolHistoricalLiquiditiesQuery = {
  __typename?: 'Query';
  poolHistoricalLiquidities: Array<{
    __typename?: 'PoolHistoricalLiquidity';
    id: string;
    poolTotalShares: string;
    poolLiquidity: string;
    poolShareValue: string;
    pricingAsset: string;
    block: string;
    poolId: {
      __typename?: 'Pool';
      id: string;
    };
  }>;
};
type PoolSnapshotsQueryVariables = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<PoolSnapshot_OrderBy>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<PoolSnapshot_Filter>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type PoolSnapshotsQuery = {
  __typename?: 'Query';
  poolSnapshots: Array<{
    __typename?: 'PoolSnapshot';
    id: string;
    totalShares: string;
    swapVolume: string;
    swapFees: string;
    timestamp: number;
    pool: {
      __typename?: 'Pool';
      id: string;
    };
  }>;
};
type JoinExitsQueryVariables = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<JoinExit_OrderBy>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<JoinExit_Filter>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type JoinExitsQuery = {
  __typename?: 'Query';
  joinExits: Array<{
    __typename?: 'JoinExit';
    amounts: Array<string>;
    id: string;
    sender: string;
    timestamp: number;
    tx: string;
    type: InvestType;
    user: {
      __typename?: 'User';
      id: string;
    };
    pool: {
      __typename?: 'Pool';
      id: string;
      tokensList: Array<string>;
    };
  }>;
};
type SubgraphJoinExitFragment = {
  __typename?: 'JoinExit';
  amounts: Array<string>;
  id: string;
  sender: string;
  timestamp: number;
  tx: string;
  type: InvestType;
  user: {
    __typename?: 'User';
    id: string;
  };
  pool: {
    __typename?: 'Pool';
    id: string;
    tokensList: Array<string>;
  };
};
type BalancersQueryVariables = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<Balancer_OrderBy>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<Balancer_Filter>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type BalancersQuery = {
  __typename?: 'Query';
  balancers: Array<{
    __typename?: 'Balancer';
    id: string;
    totalLiquidity: string;
    totalSwapVolume: string;
    totalSwapFee: string;
    totalSwapCount: string;
    poolCount: number;
  }>;
};
type TokenPricesQueryVariables = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<TokenPrice_OrderBy>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<TokenPrice_Filter>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type TokenPricesQuery = {
  __typename?: 'Query';
  tokenPrices: Array<{
    __typename?: 'TokenPrice';
    id: string;
    asset: string;
    amount: string;
    pricingAsset: string;
    price: string;
    block: string;
    timestamp: number;
    poolId: {
      __typename?: 'Pool';
      id: string;
    };
  }>;
};
type TokenLatestPricesQueryVariables = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<LatestPrice_OrderBy>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<LatestPrice_Filter>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type TokenLatestPricesQuery = {
  __typename?: 'Query';
  latestPrices: Array<{
    __typename?: 'LatestPrice';
    id: string;
    asset: string;
    price: string;
    pricingAsset: string;
    poolId: {
      __typename?: 'Pool';
      id: string;
    };
  }>;
};
type TokenLatestPriceQueryVariables = Exact$1<{
  id: Scalars$1['ID'];
}>;
type TokenLatestPriceQuery = {
  __typename?: 'Query';
  latestPrice?: {
    __typename?: 'LatestPrice';
    id: string;
    asset: string;
    price: string;
    pricingAsset: string;
    poolId: {
      __typename?: 'Pool';
      id: string;
    };
  } | null;
};
type UserQueryVariables = Exact$1<{
  id: Scalars$1['ID'];
  block?: InputMaybe$1<Block_Height$1>;
}>;
type UserQuery = {
  __typename?: 'Query';
  user?: {
    __typename?: 'User';
    id: string;
    sharesOwned?: Array<{
      __typename?: 'PoolShare';
      balance: string;
      poolId: {
        __typename?: 'Pool';
        id: string;
      };
    }> | null;
  } | null;
};
type UsersQueryVariables = Exact$1<{
  skip?: InputMaybe$1<Scalars$1['Int']>;
  first?: InputMaybe$1<Scalars$1['Int']>;
  orderBy?: InputMaybe$1<User_OrderBy>;
  orderDirection?: InputMaybe$1<OrderDirection$1>;
  where?: InputMaybe$1<User_Filter$1>;
  block?: InputMaybe$1<Block_Height$1>;
}>;
type UsersQuery = {
  __typename?: 'Query';
  users: Array<{
    __typename?: 'User';
    id: string;
    sharesOwned?: Array<{
      __typename?: 'PoolShare';
      balance: string;
      poolId: {
        __typename?: 'Pool';
        id: string;
      };
    }> | null;
  }>;
};
type SdkFunctionWrapper$1 = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string
) => Promise<T>;
declare function getSdk$1(
  client: GraphQLClient,
  withWrapper?: SdkFunctionWrapper$1
): {
  PoolShare(
    variables: PoolShareQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<PoolShareQuery>;
  PoolShares(
    variables?: PoolSharesQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<PoolSharesQuery>;
  Pools(
    variables?: PoolsQueryVariables$1,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<PoolsQuery$1>;
  AllPools(
    variables?: AllPoolsQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<AllPoolsQuery>;
  Pool(
    variables: PoolQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<PoolQuery>;
  PoolHistoricalLiquidities(
    variables?: PoolHistoricalLiquiditiesQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<PoolHistoricalLiquiditiesQuery>;
  PoolSnapshots(
    variables?: PoolSnapshotsQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<PoolSnapshotsQuery>;
  JoinExits(
    variables?: JoinExitsQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<JoinExitsQuery>;
  Balancers(
    variables?: BalancersQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<BalancersQuery>;
  TokenPrices(
    variables?: TokenPricesQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<TokenPricesQuery>;
  TokenLatestPrices(
    variables?: TokenLatestPricesQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<TokenLatestPricesQuery>;
  TokenLatestPrice(
    variables: TokenLatestPriceQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<TokenLatestPriceQuery>;
  User(
    variables: UserQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<UserQuery>;
  Users(
    variables?: UsersQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<UsersQuery>;
};
type Sdk$1 = ReturnType<typeof getSdk$1>;

type Maybe<T> = T | null;
type InputMaybe<T> = Maybe<T>;
type Exact<
  T extends {
    [key: string]: unknown;
  }
> = {
  [K in keyof T]: T[K];
};
/** All built-in and custom scalars, mapped to their actual values */
type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: string;
  BigInt: string;
  Bytes: string;
};
type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};
type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};
declare enum Chain {
  Arbitrum = 'Arbitrum',
  Optimism = 'Optimism',
  Polygon = 'Polygon',
}
type Gauge = {
  __typename?: 'Gauge';
  /**  Timestamp at which Balancer DAO added the gauge to GaugeController [seconds]  */
  addedTimestamp: Scalars['Int'];
  /**  Address of the gauge  */
  address: Scalars['Bytes'];
  /**  Equal to: <gaugeAddress>-<typeID>  */
  id: Scalars['ID'];
  /**  Reference to LiquidityGauge  */
  liquidityGauge?: Maybe<LiquidityGauge$1>;
  /**  Reference to RootGauge  */
  rootGauge?: Maybe<RootGauge>;
  /**  Type of the gauge  */
  type: GaugeType;
};
type GaugeFactory = {
  __typename?: 'GaugeFactory';
  /**  List of gauges created through the factory  */
  gauges?: Maybe<Array<LiquidityGauge$1>>;
  /**  Factory contract address  */
  id: Scalars['ID'];
  /**  Number of gauges created through the factory  */
  numGauges: Scalars['Int'];
};
type GaugeFactory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<GaugeFactory_Filter>>>;
  gauges_?: InputMaybe<LiquidityGauge_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  numGauges?: InputMaybe<Scalars['Int']>;
  numGauges_gt?: InputMaybe<Scalars['Int']>;
  numGauges_gte?: InputMaybe<Scalars['Int']>;
  numGauges_in?: InputMaybe<Array<Scalars['Int']>>;
  numGauges_lt?: InputMaybe<Scalars['Int']>;
  numGauges_lte?: InputMaybe<Scalars['Int']>;
  numGauges_not?: InputMaybe<Scalars['Int']>;
  numGauges_not_in?: InputMaybe<Array<Scalars['Int']>>;
  or?: InputMaybe<Array<InputMaybe<GaugeFactory_Filter>>>;
};
type GaugeShare$1 = {
  __typename?: 'GaugeShare';
  /**  User's balance of gauge deposit tokens  */
  balance: Scalars['BigDecimal'];
  /**  Reference to LiquidityGauge entity  */
  gauge: LiquidityGauge$1;
  /**  Equal to: <userAddress>-<gaugeAddress>  */
  id: Scalars['ID'];
  /**  Reference to User entity  */
  user: User;
};
type GaugeShare_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<GaugeShare_Filter>>>;
  balance?: InputMaybe<Scalars['BigDecimal']>;
  balance_gt?: InputMaybe<Scalars['BigDecimal']>;
  balance_gte?: InputMaybe<Scalars['BigDecimal']>;
  balance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  balance_lt?: InputMaybe<Scalars['BigDecimal']>;
  balance_lte?: InputMaybe<Scalars['BigDecimal']>;
  balance_not?: InputMaybe<Scalars['BigDecimal']>;
  balance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  gauge?: InputMaybe<Scalars['String']>;
  gauge_?: InputMaybe<LiquidityGauge_Filter>;
  gauge_contains?: InputMaybe<Scalars['String']>;
  gauge_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_ends_with?: InputMaybe<Scalars['String']>;
  gauge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_gt?: InputMaybe<Scalars['String']>;
  gauge_gte?: InputMaybe<Scalars['String']>;
  gauge_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_lt?: InputMaybe<Scalars['String']>;
  gauge_lte?: InputMaybe<Scalars['String']>;
  gauge_not?: InputMaybe<Scalars['String']>;
  gauge_not_contains?: InputMaybe<Scalars['String']>;
  gauge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_not_starts_with?: InputMaybe<Scalars['String']>;
  gauge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_starts_with?: InputMaybe<Scalars['String']>;
  gauge_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<GaugeShare_Filter>>>;
  user?: InputMaybe<Scalars['String']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']>;
  user_contains_nocase?: InputMaybe<Scalars['String']>;
  user_ends_with?: InputMaybe<Scalars['String']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']>;
  user_gt?: InputMaybe<Scalars['String']>;
  user_gte?: InputMaybe<Scalars['String']>;
  user_in?: InputMaybe<Array<Scalars['String']>>;
  user_lt?: InputMaybe<Scalars['String']>;
  user_lte?: InputMaybe<Scalars['String']>;
  user_not?: InputMaybe<Scalars['String']>;
  user_not_contains?: InputMaybe<Scalars['String']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']>;
  user_not_ends_with?: InputMaybe<Scalars['String']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  user_not_in?: InputMaybe<Array<Scalars['String']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  user_starts_with?: InputMaybe<Scalars['String']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']>;
};
declare enum GaugeShare_OrderBy {
  balance = 'balance',
  gauge = 'gauge',
  gauge__id = 'gauge__id',
  gauge__isKilled = 'gauge__isKilled',
  gauge__isPreferentialGauge = 'gauge__isPreferentialGauge',
  gauge__poolAddress = 'gauge__poolAddress',
  gauge__poolId = 'gauge__poolId',
  gauge__relativeWeightCap = 'gauge__relativeWeightCap',
  gauge__streamer = 'gauge__streamer',
  gauge__symbol = 'gauge__symbol',
  gauge__totalSupply = 'gauge__totalSupply',
  id = 'id',
  user = 'user',
  user__id = 'user__id',
}
type GaugeType = {
  __typename?: 'GaugeType';
  /**  Type ID  */
  id: Scalars['ID'];
  /**  Name of the type - empty string if call reverts  */
  name: Scalars['String'];
};
type GaugeType_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<GaugeType_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<GaugeType_Filter>>>;
};
type GaugeVote = {
  __typename?: 'GaugeVote';
  /**  Reference to Gauge entity  */
  gauge: Gauge;
  /**  Equal to: <userAddress>-<gaugeAddress>  */
  id: Scalars['ID'];
  /**  Timestamp at which user voted [seconds]  */
  timestamp?: Maybe<Scalars['BigInt']>;
  /**  Reference to User entity  */
  user: User;
  /**  Weight of veBAL power user has used to vote  */
  weight?: Maybe<Scalars['BigDecimal']>;
};
type GaugeVote_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<GaugeVote_Filter>>>;
  gauge?: InputMaybe<Scalars['String']>;
  gauge_?: InputMaybe<Gauge_Filter>;
  gauge_contains?: InputMaybe<Scalars['String']>;
  gauge_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_ends_with?: InputMaybe<Scalars['String']>;
  gauge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_gt?: InputMaybe<Scalars['String']>;
  gauge_gte?: InputMaybe<Scalars['String']>;
  gauge_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_lt?: InputMaybe<Scalars['String']>;
  gauge_lte?: InputMaybe<Scalars['String']>;
  gauge_not?: InputMaybe<Scalars['String']>;
  gauge_not_contains?: InputMaybe<Scalars['String']>;
  gauge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_not_starts_with?: InputMaybe<Scalars['String']>;
  gauge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_starts_with?: InputMaybe<Scalars['String']>;
  gauge_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<GaugeVote_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  user?: InputMaybe<Scalars['String']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']>;
  user_contains_nocase?: InputMaybe<Scalars['String']>;
  user_ends_with?: InputMaybe<Scalars['String']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']>;
  user_gt?: InputMaybe<Scalars['String']>;
  user_gte?: InputMaybe<Scalars['String']>;
  user_in?: InputMaybe<Array<Scalars['String']>>;
  user_lt?: InputMaybe<Scalars['String']>;
  user_lte?: InputMaybe<Scalars['String']>;
  user_not?: InputMaybe<Scalars['String']>;
  user_not_contains?: InputMaybe<Scalars['String']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']>;
  user_not_ends_with?: InputMaybe<Scalars['String']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  user_not_in?: InputMaybe<Array<Scalars['String']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  user_starts_with?: InputMaybe<Scalars['String']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']>;
  weight?: InputMaybe<Scalars['BigDecimal']>;
  weight_gt?: InputMaybe<Scalars['BigDecimal']>;
  weight_gte?: InputMaybe<Scalars['BigDecimal']>;
  weight_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  weight_lt?: InputMaybe<Scalars['BigDecimal']>;
  weight_lte?: InputMaybe<Scalars['BigDecimal']>;
  weight_not?: InputMaybe<Scalars['BigDecimal']>;
  weight_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};
type Gauge_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  addedTimestamp?: InputMaybe<Scalars['Int']>;
  addedTimestamp_gt?: InputMaybe<Scalars['Int']>;
  addedTimestamp_gte?: InputMaybe<Scalars['Int']>;
  addedTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  addedTimestamp_lt?: InputMaybe<Scalars['Int']>;
  addedTimestamp_lte?: InputMaybe<Scalars['Int']>;
  addedTimestamp_not?: InputMaybe<Scalars['Int']>;
  addedTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  and?: InputMaybe<Array<InputMaybe<Gauge_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  liquidityGauge?: InputMaybe<Scalars['String']>;
  liquidityGauge_?: InputMaybe<LiquidityGauge_Filter>;
  liquidityGauge_contains?: InputMaybe<Scalars['String']>;
  liquidityGauge_contains_nocase?: InputMaybe<Scalars['String']>;
  liquidityGauge_ends_with?: InputMaybe<Scalars['String']>;
  liquidityGauge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  liquidityGauge_gt?: InputMaybe<Scalars['String']>;
  liquidityGauge_gte?: InputMaybe<Scalars['String']>;
  liquidityGauge_in?: InputMaybe<Array<Scalars['String']>>;
  liquidityGauge_lt?: InputMaybe<Scalars['String']>;
  liquidityGauge_lte?: InputMaybe<Scalars['String']>;
  liquidityGauge_not?: InputMaybe<Scalars['String']>;
  liquidityGauge_not_contains?: InputMaybe<Scalars['String']>;
  liquidityGauge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  liquidityGauge_not_ends_with?: InputMaybe<Scalars['String']>;
  liquidityGauge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  liquidityGauge_not_in?: InputMaybe<Array<Scalars['String']>>;
  liquidityGauge_not_starts_with?: InputMaybe<Scalars['String']>;
  liquidityGauge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  liquidityGauge_starts_with?: InputMaybe<Scalars['String']>;
  liquidityGauge_starts_with_nocase?: InputMaybe<Scalars['String']>;
  or?: InputMaybe<Array<InputMaybe<Gauge_Filter>>>;
  rootGauge?: InputMaybe<Scalars['String']>;
  rootGauge_?: InputMaybe<RootGauge_Filter>;
  rootGauge_contains?: InputMaybe<Scalars['String']>;
  rootGauge_contains_nocase?: InputMaybe<Scalars['String']>;
  rootGauge_ends_with?: InputMaybe<Scalars['String']>;
  rootGauge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  rootGauge_gt?: InputMaybe<Scalars['String']>;
  rootGauge_gte?: InputMaybe<Scalars['String']>;
  rootGauge_in?: InputMaybe<Array<Scalars['String']>>;
  rootGauge_lt?: InputMaybe<Scalars['String']>;
  rootGauge_lte?: InputMaybe<Scalars['String']>;
  rootGauge_not?: InputMaybe<Scalars['String']>;
  rootGauge_not_contains?: InputMaybe<Scalars['String']>;
  rootGauge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  rootGauge_not_ends_with?: InputMaybe<Scalars['String']>;
  rootGauge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  rootGauge_not_in?: InputMaybe<Array<Scalars['String']>>;
  rootGauge_not_starts_with?: InputMaybe<Scalars['String']>;
  rootGauge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  rootGauge_starts_with?: InputMaybe<Scalars['String']>;
  rootGauge_starts_with_nocase?: InputMaybe<Scalars['String']>;
  type?: InputMaybe<Scalars['String']>;
  type_?: InputMaybe<GaugeType_Filter>;
  type_contains?: InputMaybe<Scalars['String']>;
  type_contains_nocase?: InputMaybe<Scalars['String']>;
  type_ends_with?: InputMaybe<Scalars['String']>;
  type_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_gt?: InputMaybe<Scalars['String']>;
  type_gte?: InputMaybe<Scalars['String']>;
  type_in?: InputMaybe<Array<Scalars['String']>>;
  type_lt?: InputMaybe<Scalars['String']>;
  type_lte?: InputMaybe<Scalars['String']>;
  type_not?: InputMaybe<Scalars['String']>;
  type_not_contains?: InputMaybe<Scalars['String']>;
  type_not_contains_nocase?: InputMaybe<Scalars['String']>;
  type_not_ends_with?: InputMaybe<Scalars['String']>;
  type_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  type_not_in?: InputMaybe<Array<Scalars['String']>>;
  type_not_starts_with?: InputMaybe<Scalars['String']>;
  type_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  type_starts_with?: InputMaybe<Scalars['String']>;
  type_starts_with_nocase?: InputMaybe<Scalars['String']>;
};
type LiquidityGauge$1 = {
  __typename?: 'LiquidityGauge';
  /**  Factory contract address  */
  factory: GaugeFactory;
  /**  Reference to Gauge entity - created when LiquidityGauge is added to GaugeController */
  gauge?: Maybe<Gauge>;
  /**  LiquidityGauge contract address  */
  id: Scalars['ID'];
  /**  Whether Balancer DAO killed the gauge  */
  isKilled: Scalars['Boolean'];
  /**  Whether the LiquidityGauge is the most recent added to GaugeController  */
  isPreferentialGauge: Scalars['Boolean'];
  /**  Reference to Pool entity  */
  pool?: Maybe<Pool$2>;
  /**  Address of the pool (lp_token of the gauge)  */
  poolAddress: Scalars['Bytes'];
  /**  Pool ID if lp_token is a Balancer pool; null otherwise  */
  poolId?: Maybe<Scalars['Bytes']>;
  /**  Relative weight cap of the gauge (0.01 = 1%) - V2 factories only  */
  relativeWeightCap?: Maybe<Scalars['BigDecimal']>;
  /**  List of user shares  */
  shares?: Maybe<Array<GaugeShare$1>>;
  /**  Address of the contract that streams reward tokens to the gauge - ChildChainLiquidityGauge only  */
  streamer?: Maybe<Scalars['Bytes']>;
  /**  ERC20 token symbol  */
  symbol: Scalars['String'];
  /**  List of reward tokens depositted in the gauge  */
  tokens?: Maybe<Array<RewardToken>>;
  /**  Total of BPTs users have staked in the LiquidityGauge  */
  totalSupply: Scalars['BigDecimal'];
};
type LiquidityGauge_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LiquidityGauge_Filter>>>;
  factory?: InputMaybe<Scalars['String']>;
  factory_?: InputMaybe<GaugeFactory_Filter>;
  factory_contains?: InputMaybe<Scalars['String']>;
  factory_contains_nocase?: InputMaybe<Scalars['String']>;
  factory_ends_with?: InputMaybe<Scalars['String']>;
  factory_ends_with_nocase?: InputMaybe<Scalars['String']>;
  factory_gt?: InputMaybe<Scalars['String']>;
  factory_gte?: InputMaybe<Scalars['String']>;
  factory_in?: InputMaybe<Array<Scalars['String']>>;
  factory_lt?: InputMaybe<Scalars['String']>;
  factory_lte?: InputMaybe<Scalars['String']>;
  factory_not?: InputMaybe<Scalars['String']>;
  factory_not_contains?: InputMaybe<Scalars['String']>;
  factory_not_contains_nocase?: InputMaybe<Scalars['String']>;
  factory_not_ends_with?: InputMaybe<Scalars['String']>;
  factory_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  factory_not_in?: InputMaybe<Array<Scalars['String']>>;
  factory_not_starts_with?: InputMaybe<Scalars['String']>;
  factory_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  factory_starts_with?: InputMaybe<Scalars['String']>;
  factory_starts_with_nocase?: InputMaybe<Scalars['String']>;
  gauge?: InputMaybe<Scalars['String']>;
  gauge_?: InputMaybe<Gauge_Filter>;
  gauge_contains?: InputMaybe<Scalars['String']>;
  gauge_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_ends_with?: InputMaybe<Scalars['String']>;
  gauge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_gt?: InputMaybe<Scalars['String']>;
  gauge_gte?: InputMaybe<Scalars['String']>;
  gauge_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_lt?: InputMaybe<Scalars['String']>;
  gauge_lte?: InputMaybe<Scalars['String']>;
  gauge_not?: InputMaybe<Scalars['String']>;
  gauge_not_contains?: InputMaybe<Scalars['String']>;
  gauge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_not_starts_with?: InputMaybe<Scalars['String']>;
  gauge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_starts_with?: InputMaybe<Scalars['String']>;
  gauge_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  isKilled?: InputMaybe<Scalars['Boolean']>;
  isKilled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isKilled_not?: InputMaybe<Scalars['Boolean']>;
  isKilled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isPreferentialGauge?: InputMaybe<Scalars['Boolean']>;
  isPreferentialGauge_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isPreferentialGauge_not?: InputMaybe<Scalars['Boolean']>;
  isPreferentialGauge_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  or?: InputMaybe<Array<InputMaybe<LiquidityGauge_Filter>>>;
  pool?: InputMaybe<Scalars['String']>;
  poolAddress?: InputMaybe<Scalars['Bytes']>;
  poolAddress_contains?: InputMaybe<Scalars['Bytes']>;
  poolAddress_gt?: InputMaybe<Scalars['Bytes']>;
  poolAddress_gte?: InputMaybe<Scalars['Bytes']>;
  poolAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  poolAddress_lt?: InputMaybe<Scalars['Bytes']>;
  poolAddress_lte?: InputMaybe<Scalars['Bytes']>;
  poolAddress_not?: InputMaybe<Scalars['Bytes']>;
  poolAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  poolAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  poolId?: InputMaybe<Scalars['Bytes']>;
  poolId_contains?: InputMaybe<Scalars['Bytes']>;
  poolId_gt?: InputMaybe<Scalars['Bytes']>;
  poolId_gte?: InputMaybe<Scalars['Bytes']>;
  poolId_in?: InputMaybe<Array<Scalars['Bytes']>>;
  poolId_lt?: InputMaybe<Scalars['Bytes']>;
  poolId_lte?: InputMaybe<Scalars['Bytes']>;
  poolId_not?: InputMaybe<Scalars['Bytes']>;
  poolId_not_contains?: InputMaybe<Scalars['Bytes']>;
  poolId_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  pool_?: InputMaybe<Pool_Filter>;
  pool_contains?: InputMaybe<Scalars['String']>;
  pool_contains_nocase?: InputMaybe<Scalars['String']>;
  pool_ends_with?: InputMaybe<Scalars['String']>;
  pool_ends_with_nocase?: InputMaybe<Scalars['String']>;
  pool_gt?: InputMaybe<Scalars['String']>;
  pool_gte?: InputMaybe<Scalars['String']>;
  pool_in?: InputMaybe<Array<Scalars['String']>>;
  pool_lt?: InputMaybe<Scalars['String']>;
  pool_lte?: InputMaybe<Scalars['String']>;
  pool_not?: InputMaybe<Scalars['String']>;
  pool_not_contains?: InputMaybe<Scalars['String']>;
  pool_not_contains_nocase?: InputMaybe<Scalars['String']>;
  pool_not_ends_with?: InputMaybe<Scalars['String']>;
  pool_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  pool_not_in?: InputMaybe<Array<Scalars['String']>>;
  pool_not_starts_with?: InputMaybe<Scalars['String']>;
  pool_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  pool_starts_with?: InputMaybe<Scalars['String']>;
  pool_starts_with_nocase?: InputMaybe<Scalars['String']>;
  relativeWeightCap?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_gt?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_gte?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  relativeWeightCap_lt?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_lte?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_not?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  shares_?: InputMaybe<GaugeShare_Filter>;
  streamer?: InputMaybe<Scalars['Bytes']>;
  streamer_contains?: InputMaybe<Scalars['Bytes']>;
  streamer_gt?: InputMaybe<Scalars['Bytes']>;
  streamer_gte?: InputMaybe<Scalars['Bytes']>;
  streamer_in?: InputMaybe<Array<Scalars['Bytes']>>;
  streamer_lt?: InputMaybe<Scalars['Bytes']>;
  streamer_lte?: InputMaybe<Scalars['Bytes']>;
  streamer_not?: InputMaybe<Scalars['Bytes']>;
  streamer_not_contains?: InputMaybe<Scalars['Bytes']>;
  streamer_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  tokens_?: InputMaybe<RewardToken_Filter>;
  totalSupply?: InputMaybe<Scalars['BigDecimal']>;
  totalSupply_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalSupply_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalSupply_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalSupply_not?: InputMaybe<Scalars['BigDecimal']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};
declare enum LiquidityGauge_OrderBy {
  factory = 'factory',
  factory__id = 'factory__id',
  factory__numGauges = 'factory__numGauges',
  gauge = 'gauge',
  gauge__addedTimestamp = 'gauge__addedTimestamp',
  gauge__address = 'gauge__address',
  gauge__id = 'gauge__id',
  id = 'id',
  isKilled = 'isKilled',
  isPreferentialGauge = 'isPreferentialGauge',
  pool = 'pool',
  poolAddress = 'poolAddress',
  poolId = 'poolId',
  pool__address = 'pool__address',
  pool__id = 'pool__id',
  pool__poolId = 'pool__poolId',
  relativeWeightCap = 'relativeWeightCap',
  shares = 'shares',
  streamer = 'streamer',
  symbol = 'symbol',
  tokens = 'tokens',
  totalSupply = 'totalSupply',
}
/** Defines the order direction, either ascending or descending */
declare enum OrderDirection {
  asc = 'asc',
  desc = 'desc',
}
type Pool$2 = {
  __typename?: 'Pool';
  /**  Address of the pool (lp_token of the gauge)  */
  address: Scalars['Bytes'];
  /**  List of gauges created for the pool  */
  gauges?: Maybe<Array<LiquidityGauge$1>>;
  /**  List of the pool's gauges addresses  */
  gaugesList: Array<Scalars['Bytes']>;
  /**  Address of the pool (lp_token of the gauge)  */
  id: Scalars['ID'];
  /**  Pool ID if lp_token is a Balancer pool; null otherwise  */
  poolId?: Maybe<Scalars['Bytes']>;
  /**  Most recent, unkilled gauge in the GaugeController  */
  preferentialGauge?: Maybe<LiquidityGauge$1>;
};
type Pool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']>;
  address_contains?: InputMaybe<Scalars['Bytes']>;
  address_gt?: InputMaybe<Scalars['Bytes']>;
  address_gte?: InputMaybe<Scalars['Bytes']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']>>;
  address_lt?: InputMaybe<Scalars['Bytes']>;
  address_lte?: InputMaybe<Scalars['Bytes']>;
  address_not?: InputMaybe<Scalars['Bytes']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  and?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
  gaugesList?: InputMaybe<Array<Scalars['Bytes']>>;
  gaugesList_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  gaugesList_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  gaugesList_not?: InputMaybe<Array<Scalars['Bytes']>>;
  gaugesList_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  gaugesList_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  gauges_?: InputMaybe<LiquidityGauge_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<Pool_Filter>>>;
  poolId?: InputMaybe<Scalars['Bytes']>;
  poolId_contains?: InputMaybe<Scalars['Bytes']>;
  poolId_gt?: InputMaybe<Scalars['Bytes']>;
  poolId_gte?: InputMaybe<Scalars['Bytes']>;
  poolId_in?: InputMaybe<Array<Scalars['Bytes']>>;
  poolId_lt?: InputMaybe<Scalars['Bytes']>;
  poolId_lte?: InputMaybe<Scalars['Bytes']>;
  poolId_not?: InputMaybe<Scalars['Bytes']>;
  poolId_not_contains?: InputMaybe<Scalars['Bytes']>;
  poolId_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  preferentialGauge?: InputMaybe<Scalars['String']>;
  preferentialGauge_?: InputMaybe<LiquidityGauge_Filter>;
  preferentialGauge_contains?: InputMaybe<Scalars['String']>;
  preferentialGauge_contains_nocase?: InputMaybe<Scalars['String']>;
  preferentialGauge_ends_with?: InputMaybe<Scalars['String']>;
  preferentialGauge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  preferentialGauge_gt?: InputMaybe<Scalars['String']>;
  preferentialGauge_gte?: InputMaybe<Scalars['String']>;
  preferentialGauge_in?: InputMaybe<Array<Scalars['String']>>;
  preferentialGauge_lt?: InputMaybe<Scalars['String']>;
  preferentialGauge_lte?: InputMaybe<Scalars['String']>;
  preferentialGauge_not?: InputMaybe<Scalars['String']>;
  preferentialGauge_not_contains?: InputMaybe<Scalars['String']>;
  preferentialGauge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  preferentialGauge_not_ends_with?: InputMaybe<Scalars['String']>;
  preferentialGauge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  preferentialGauge_not_in?: InputMaybe<Array<Scalars['String']>>;
  preferentialGauge_not_starts_with?: InputMaybe<Scalars['String']>;
  preferentialGauge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  preferentialGauge_starts_with?: InputMaybe<Scalars['String']>;
  preferentialGauge_starts_with_nocase?: InputMaybe<Scalars['String']>;
};
declare enum Pool_OrderBy {
  address = 'address',
  gauges = 'gauges',
  gaugesList = 'gaugesList',
  id = 'id',
  poolId = 'poolId',
  preferentialGauge = 'preferentialGauge',
  preferentialGauge__id = 'preferentialGauge__id',
  preferentialGauge__isKilled = 'preferentialGauge__isKilled',
  preferentialGauge__isPreferentialGauge = 'preferentialGauge__isPreferentialGauge',
  preferentialGauge__poolAddress = 'preferentialGauge__poolAddress',
  preferentialGauge__poolId = 'preferentialGauge__poolId',
  preferentialGauge__relativeWeightCap = 'preferentialGauge__relativeWeightCap',
  preferentialGauge__streamer = 'preferentialGauge__streamer',
  preferentialGauge__symbol = 'preferentialGauge__symbol',
  preferentialGauge__totalSupply = 'preferentialGauge__totalSupply',
}
type RewardToken = {
  __typename?: 'RewardToken';
  /**  ERC20 token decimals - zero if call to decimals() reverts  */
  decimals: Scalars['Int'];
  /**  Reference to LiquidityGauge entity  */
  gauge: LiquidityGauge$1;
  /**  Equal to: <tokenAddress>-<gaugeAddress>  */
  id: Scalars['ID'];
  /**  Timestamp at which finishes the period of rewards  */
  periodFinish?: Maybe<Scalars['BigInt']>;
  /**  Rate of reward tokens streamed per second  */
  rate?: Maybe<Scalars['BigDecimal']>;
  /**  ERC20 token symbol - empty string if call to symbol() reverts  */
  symbol: Scalars['String'];
  /**  Amount of reward tokens that has been deposited into the gauge  */
  totalDeposited: Scalars['BigDecimal'];
};
type RewardToken_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<RewardToken_Filter>>>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  gauge?: InputMaybe<Scalars['String']>;
  gauge_?: InputMaybe<LiquidityGauge_Filter>;
  gauge_contains?: InputMaybe<Scalars['String']>;
  gauge_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_ends_with?: InputMaybe<Scalars['String']>;
  gauge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_gt?: InputMaybe<Scalars['String']>;
  gauge_gte?: InputMaybe<Scalars['String']>;
  gauge_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_lt?: InputMaybe<Scalars['String']>;
  gauge_lte?: InputMaybe<Scalars['String']>;
  gauge_not?: InputMaybe<Scalars['String']>;
  gauge_not_contains?: InputMaybe<Scalars['String']>;
  gauge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_not_starts_with?: InputMaybe<Scalars['String']>;
  gauge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_starts_with?: InputMaybe<Scalars['String']>;
  gauge_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<RewardToken_Filter>>>;
  periodFinish?: InputMaybe<Scalars['BigInt']>;
  periodFinish_gt?: InputMaybe<Scalars['BigInt']>;
  periodFinish_gte?: InputMaybe<Scalars['BigInt']>;
  periodFinish_in?: InputMaybe<Array<Scalars['BigInt']>>;
  periodFinish_lt?: InputMaybe<Scalars['BigInt']>;
  periodFinish_lte?: InputMaybe<Scalars['BigInt']>;
  periodFinish_not?: InputMaybe<Scalars['BigInt']>;
  periodFinish_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  rate?: InputMaybe<Scalars['BigDecimal']>;
  rate_gt?: InputMaybe<Scalars['BigDecimal']>;
  rate_gte?: InputMaybe<Scalars['BigDecimal']>;
  rate_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  rate_lt?: InputMaybe<Scalars['BigDecimal']>;
  rate_lte?: InputMaybe<Scalars['BigDecimal']>;
  rate_not?: InputMaybe<Scalars['BigDecimal']>;
  rate_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  totalDeposited?: InputMaybe<Scalars['BigDecimal']>;
  totalDeposited_gt?: InputMaybe<Scalars['BigDecimal']>;
  totalDeposited_gte?: InputMaybe<Scalars['BigDecimal']>;
  totalDeposited_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  totalDeposited_lt?: InputMaybe<Scalars['BigDecimal']>;
  totalDeposited_lte?: InputMaybe<Scalars['BigDecimal']>;
  totalDeposited_not?: InputMaybe<Scalars['BigDecimal']>;
  totalDeposited_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};
type RootGauge = {
  __typename?: 'RootGauge';
  /**  Chain where emissions by this gauge will be bridged to  */
  chain: Chain;
  /**  Factory contract address  */
  factory: GaugeFactory;
  /**  Reference to Gauge entity - created when LiquidityGauge is added to GaugeController */
  gauge?: Maybe<Gauge>;
  /**  RootGauge contract address */
  id: Scalars['ID'];
  /**  Whether Balancer DAO killed the gauge  */
  isKilled: Scalars['Boolean'];
  /**  Address where emissions by this gauge will be bridged to  */
  recipient: Scalars['Bytes'];
  /**  Relative weight cap of the gauge (0.01 = 1%) - V2 factories only  */
  relativeWeightCap?: Maybe<Scalars['BigDecimal']>;
};
type RootGauge_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<RootGauge_Filter>>>;
  chain?: InputMaybe<Chain>;
  chain_in?: InputMaybe<Array<Chain>>;
  chain_not?: InputMaybe<Chain>;
  chain_not_in?: InputMaybe<Array<Chain>>;
  factory?: InputMaybe<Scalars['String']>;
  factory_?: InputMaybe<GaugeFactory_Filter>;
  factory_contains?: InputMaybe<Scalars['String']>;
  factory_contains_nocase?: InputMaybe<Scalars['String']>;
  factory_ends_with?: InputMaybe<Scalars['String']>;
  factory_ends_with_nocase?: InputMaybe<Scalars['String']>;
  factory_gt?: InputMaybe<Scalars['String']>;
  factory_gte?: InputMaybe<Scalars['String']>;
  factory_in?: InputMaybe<Array<Scalars['String']>>;
  factory_lt?: InputMaybe<Scalars['String']>;
  factory_lte?: InputMaybe<Scalars['String']>;
  factory_not?: InputMaybe<Scalars['String']>;
  factory_not_contains?: InputMaybe<Scalars['String']>;
  factory_not_contains_nocase?: InputMaybe<Scalars['String']>;
  factory_not_ends_with?: InputMaybe<Scalars['String']>;
  factory_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  factory_not_in?: InputMaybe<Array<Scalars['String']>>;
  factory_not_starts_with?: InputMaybe<Scalars['String']>;
  factory_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  factory_starts_with?: InputMaybe<Scalars['String']>;
  factory_starts_with_nocase?: InputMaybe<Scalars['String']>;
  gauge?: InputMaybe<Scalars['String']>;
  gauge_?: InputMaybe<Gauge_Filter>;
  gauge_contains?: InputMaybe<Scalars['String']>;
  gauge_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_ends_with?: InputMaybe<Scalars['String']>;
  gauge_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_gt?: InputMaybe<Scalars['String']>;
  gauge_gte?: InputMaybe<Scalars['String']>;
  gauge_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_lt?: InputMaybe<Scalars['String']>;
  gauge_lte?: InputMaybe<Scalars['String']>;
  gauge_not?: InputMaybe<Scalars['String']>;
  gauge_not_contains?: InputMaybe<Scalars['String']>;
  gauge_not_contains_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with?: InputMaybe<Scalars['String']>;
  gauge_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_not_in?: InputMaybe<Array<Scalars['String']>>;
  gauge_not_starts_with?: InputMaybe<Scalars['String']>;
  gauge_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  gauge_starts_with?: InputMaybe<Scalars['String']>;
  gauge_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  isKilled?: InputMaybe<Scalars['Boolean']>;
  isKilled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isKilled_not?: InputMaybe<Scalars['Boolean']>;
  isKilled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  or?: InputMaybe<Array<InputMaybe<RootGauge_Filter>>>;
  recipient?: InputMaybe<Scalars['Bytes']>;
  recipient_contains?: InputMaybe<Scalars['Bytes']>;
  recipient_gt?: InputMaybe<Scalars['Bytes']>;
  recipient_gte?: InputMaybe<Scalars['Bytes']>;
  recipient_in?: InputMaybe<Array<Scalars['Bytes']>>;
  recipient_lt?: InputMaybe<Scalars['Bytes']>;
  recipient_lte?: InputMaybe<Scalars['Bytes']>;
  recipient_not?: InputMaybe<Scalars['Bytes']>;
  recipient_not_contains?: InputMaybe<Scalars['Bytes']>;
  recipient_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  relativeWeightCap?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_gt?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_gte?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  relativeWeightCap_lt?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_lte?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_not?: InputMaybe<Scalars['BigDecimal']>;
  relativeWeightCap_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};
type User = {
  __typename?: 'User';
  /**  List of gauge the user has shares  */
  gaugeShares?: Maybe<Array<GaugeShare$1>>;
  /**  List of votes on gauges  */
  gaugeVotes?: Maybe<Array<GaugeVote>>;
  /**  User address  */
  id: Scalars['ID'];
  /**  List of locks the user created  */
  votingLocks?: Maybe<Array<VotingEscrowLock>>;
};
type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  gaugeShares_?: InputMaybe<GaugeShare_Filter>;
  gaugeVotes_?: InputMaybe<GaugeVote_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  votingLocks_?: InputMaybe<VotingEscrowLock_Filter>;
};
type VotingEscrow = {
  __typename?: 'VotingEscrow';
  /**  VotingEscrow contract address  */
  id: Scalars['ID'];
  /**  List of veBAL locks created  */
  locks?: Maybe<Array<VotingEscrowLock>>;
  /**  Amount of B-80BAL-20WETH BPT locked  */
  stakedSupply: Scalars['BigDecimal'];
};
type VotingEscrowLock = {
  __typename?: 'VotingEscrowLock';
  /**  Equal to: <userAdress>-<votingEscrow>  */
  id: Scalars['ID'];
  /**  Amount of B-80BAL-20WETH BPT the user has locked  */
  lockedBalance: Scalars['BigDecimal'];
  /**  Timestamp at which B-80BAL-20WETH BPT can be unlocked by user [seconds]  */
  unlockTime?: Maybe<Scalars['BigInt']>;
  updatedAt: Scalars['Int'];
  /**  Reference to User entity  */
  user: User;
  /**  Reference to VotingEscrow entity  */
  votingEscrowID: VotingEscrow;
};
type VotingEscrowLock_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VotingEscrowLock_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lockedBalance?: InputMaybe<Scalars['BigDecimal']>;
  lockedBalance_gt?: InputMaybe<Scalars['BigDecimal']>;
  lockedBalance_gte?: InputMaybe<Scalars['BigDecimal']>;
  lockedBalance_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  lockedBalance_lt?: InputMaybe<Scalars['BigDecimal']>;
  lockedBalance_lte?: InputMaybe<Scalars['BigDecimal']>;
  lockedBalance_not?: InputMaybe<Scalars['BigDecimal']>;
  lockedBalance_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  or?: InputMaybe<Array<InputMaybe<VotingEscrowLock_Filter>>>;
  unlockTime?: InputMaybe<Scalars['BigInt']>;
  unlockTime_gt?: InputMaybe<Scalars['BigInt']>;
  unlockTime_gte?: InputMaybe<Scalars['BigInt']>;
  unlockTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  unlockTime_lt?: InputMaybe<Scalars['BigInt']>;
  unlockTime_lte?: InputMaybe<Scalars['BigInt']>;
  unlockTime_not?: InputMaybe<Scalars['BigInt']>;
  unlockTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  updatedAt?: InputMaybe<Scalars['Int']>;
  updatedAt_gt?: InputMaybe<Scalars['Int']>;
  updatedAt_gte?: InputMaybe<Scalars['Int']>;
  updatedAt_in?: InputMaybe<Array<Scalars['Int']>>;
  updatedAt_lt?: InputMaybe<Scalars['Int']>;
  updatedAt_lte?: InputMaybe<Scalars['Int']>;
  updatedAt_not?: InputMaybe<Scalars['Int']>;
  updatedAt_not_in?: InputMaybe<Array<Scalars['Int']>>;
  user?: InputMaybe<Scalars['String']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']>;
  user_contains_nocase?: InputMaybe<Scalars['String']>;
  user_ends_with?: InputMaybe<Scalars['String']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']>;
  user_gt?: InputMaybe<Scalars['String']>;
  user_gte?: InputMaybe<Scalars['String']>;
  user_in?: InputMaybe<Array<Scalars['String']>>;
  user_lt?: InputMaybe<Scalars['String']>;
  user_lte?: InputMaybe<Scalars['String']>;
  user_not?: InputMaybe<Scalars['String']>;
  user_not_contains?: InputMaybe<Scalars['String']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']>;
  user_not_ends_with?: InputMaybe<Scalars['String']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  user_not_in?: InputMaybe<Array<Scalars['String']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  user_starts_with?: InputMaybe<Scalars['String']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']>;
  votingEscrowID?: InputMaybe<Scalars['String']>;
  votingEscrowID_?: InputMaybe<VotingEscrow_Filter>;
  votingEscrowID_contains?: InputMaybe<Scalars['String']>;
  votingEscrowID_contains_nocase?: InputMaybe<Scalars['String']>;
  votingEscrowID_ends_with?: InputMaybe<Scalars['String']>;
  votingEscrowID_ends_with_nocase?: InputMaybe<Scalars['String']>;
  votingEscrowID_gt?: InputMaybe<Scalars['String']>;
  votingEscrowID_gte?: InputMaybe<Scalars['String']>;
  votingEscrowID_in?: InputMaybe<Array<Scalars['String']>>;
  votingEscrowID_lt?: InputMaybe<Scalars['String']>;
  votingEscrowID_lte?: InputMaybe<Scalars['String']>;
  votingEscrowID_not?: InputMaybe<Scalars['String']>;
  votingEscrowID_not_contains?: InputMaybe<Scalars['String']>;
  votingEscrowID_not_contains_nocase?: InputMaybe<Scalars['String']>;
  votingEscrowID_not_ends_with?: InputMaybe<Scalars['String']>;
  votingEscrowID_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  votingEscrowID_not_in?: InputMaybe<Array<Scalars['String']>>;
  votingEscrowID_not_starts_with?: InputMaybe<Scalars['String']>;
  votingEscrowID_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  votingEscrowID_starts_with?: InputMaybe<Scalars['String']>;
  votingEscrowID_starts_with_nocase?: InputMaybe<Scalars['String']>;
};
type VotingEscrow_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VotingEscrow_Filter>>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  locks_?: InputMaybe<VotingEscrowLock_Filter>;
  or?: InputMaybe<Array<InputMaybe<VotingEscrow_Filter>>>;
  stakedSupply?: InputMaybe<Scalars['BigDecimal']>;
  stakedSupply_gt?: InputMaybe<Scalars['BigDecimal']>;
  stakedSupply_gte?: InputMaybe<Scalars['BigDecimal']>;
  stakedSupply_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
  stakedSupply_lt?: InputMaybe<Scalars['BigDecimal']>;
  stakedSupply_lte?: InputMaybe<Scalars['BigDecimal']>;
  stakedSupply_not?: InputMaybe<Scalars['BigDecimal']>;
  stakedSupply_not_in?: InputMaybe<Array<Scalars['BigDecimal']>>;
};
type GaugeShareQueryVariables = Exact<{
  id: Scalars['ID'];
  block?: InputMaybe<Block_Height>;
}>;
type GaugeShareQuery = {
  __typename?: 'Query';
  gaugeShare?: {
    __typename?: 'GaugeShare';
    id: string;
    balance: string;
    user: {
      __typename?: 'User';
      id: string;
    };
    gauge: {
      __typename?: 'LiquidityGauge';
      id: string;
      isKilled: boolean;
      poolId?: string | null;
      poolAddress: string;
      totalSupply: string;
    };
  } | null;
};
type GaugeSharesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GaugeShare_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<GaugeShare_Filter>;
  block?: InputMaybe<Block_Height>;
}>;
type GaugeSharesQuery = {
  __typename?: 'Query';
  gaugeShares: Array<{
    __typename?: 'GaugeShare';
    id: string;
    balance: string;
    user: {
      __typename?: 'User';
      id: string;
    };
    gauge: {
      __typename?: 'LiquidityGauge';
      id: string;
      isKilled: boolean;
      poolId?: string | null;
      poolAddress: string;
      totalSupply: string;
    };
  }>;
};
type SubgraphGaugeShareFragment = {
  __typename?: 'GaugeShare';
  id: string;
  balance: string;
  user: {
    __typename?: 'User';
    id: string;
  };
  gauge: {
    __typename?: 'LiquidityGauge';
    id: string;
    isKilled: boolean;
    poolId?: string | null;
    poolAddress: string;
    totalSupply: string;
  };
};
type LiquidityGaugesQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LiquidityGauge_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LiquidityGauge_Filter>;
  block?: InputMaybe<Block_Height>;
}>;
type LiquidityGaugesQuery = {
  __typename?: 'Query';
  liquidityGauges: Array<{
    __typename?: 'LiquidityGauge';
    id: string;
    symbol: string;
    poolAddress: string;
    poolId?: string | null;
    streamer?: string | null;
    totalSupply: string;
    factory: {
      __typename?: 'GaugeFactory';
      id: string;
      numGauges: number;
    };
    tokens?: Array<{
      __typename?: 'RewardToken';
      id: string;
      symbol: string;
      decimals: number;
      totalDeposited: string;
      rate?: string | null;
      periodFinish?: string | null;
    }> | null;
  }>;
};
type PoolsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Pool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Pool_Filter>;
  block?: InputMaybe<Block_Height>;
}>;
type PoolsQuery = {
  __typename?: 'Query';
  pools: Array<{
    __typename?: 'Pool';
    id: string;
    poolId?: string | null;
    preferentialGauge?: {
      __typename?: 'LiquidityGauge';
      id: string;
      symbol: string;
      poolAddress: string;
      poolId?: string | null;
      streamer?: string | null;
      totalSupply: string;
      factory: {
        __typename?: 'GaugeFactory';
        id: string;
        numGauges: number;
      };
      tokens?: Array<{
        __typename?: 'RewardToken';
        id: string;
        symbol: string;
        decimals: number;
        totalDeposited: string;
        rate?: string | null;
        periodFinish?: string | null;
      }> | null;
    } | null;
  }>;
};
type PoolGaugesQueryVariables = Exact<{
  where?: InputMaybe<Pool_Filter>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Pool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  block?: InputMaybe<Block_Height>;
}>;
type PoolGaugesQuery = {
  __typename?: 'Query';
  pools: Array<{
    __typename?: 'Pool';
    gauges?: Array<{
      __typename?: 'LiquidityGauge';
      id: string;
      relativeWeightCap?: string | null;
    }> | null;
    preferentialGauge?: {
      __typename?: 'LiquidityGauge';
      id: string;
    } | null;
  }>;
};
type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string
) => Promise<T>;
declare function getSdk(
  client: GraphQLClient,
  withWrapper?: SdkFunctionWrapper
): {
  GaugeShare(
    variables: GaugeShareQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<GaugeShareQuery>;
  GaugeShares(
    variables?: GaugeSharesQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<GaugeSharesQuery>;
  LiquidityGauges(
    variables?: LiquidityGaugesQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<LiquidityGaugesQuery>;
  Pools(
    variables?: PoolsQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<PoolsQuery>;
  PoolGauges(
    variables?: PoolGaugesQueryVariables,
    requestHeaders?: Dom.RequestInit['headers']
  ): Promise<PoolGaugesQuery>;
};
type Sdk = ReturnType<typeof getSdk>;

type SubgraphClient = Sdk$1;
type GaugesClient = Sdk;
type SubgraphLiquidityGauge = LiquidityGauge$1;

/**
 * Access liquidity gauges indexed by subgraph.
 * Because we have ~100 gauges to save on repeated http calls we cache all results as `gauges` on an instance.
 * Balancer's subgraph URL: https://thegraph.com/hosted-service/subgraph/balancer-labs/balancer-gauges
 */
declare class LiquidityGaugesSubgraphRepository
  implements Findable<SubgraphLiquidityGauge>
{
  private client;
  gauges: SubgraphLiquidityGauge[];
  constructor(url: string);
  fetch(): Promise<SubgraphLiquidityGauge[]>;
  find(id: string): Promise<SubgraphLiquidityGauge | undefined>;
  findBy(
    param: string,
    value: string
  ): Promise<SubgraphLiquidityGauge | undefined>;
}

interface LiquidityGauge {
  id: string;
  address: string;
  name: string;
  poolId?: Maybe$1<string>;
  poolAddress: string;
  totalSupply: number;
  workingSupply: number;
  relativeWeight: number;
  rewardTokens?: {
    [tokenAddress: string]: RewardData;
  };
  claimableTokens?: {
    [tokenAddress: string]: BigNumber;
  };
}
declare class LiquidityGaugeSubgraphRPCProvider
  implements Findable<LiquidityGauge>
{
  private chainId;
  gaugeController?: GaugeControllerMulticallRepository;
  multicall: LiquidityGaugesMulticallRepository;
  subgraph: LiquidityGaugesSubgraphRepository;
  workingSupplies: {
    [gaugeAddress: string]: number;
  };
  relativeWeights: {
    [gaugeAddress: string]: number;
  };
  rewardData: {
    [gaugeAddress: string]: {
      [tokenAddress: string]: RewardData;
    };
  };
  gauges?: Promise<LiquidityGauge[]>;
  constructor(
    subgraphUrl: string,
    multicallAddress: string,
    gaugeControllerAddress: string,
    chainId: Network,
    provider: Provider
  );
  fetch(): Promise<LiquidityGauge[]>;
  find(id: string): Promise<LiquidityGauge | undefined>;
  findBy(attribute: string, value: string): Promise<LiquidityGauge | undefined>;
  private compose;
}

type PoolAttribute = 'id' | 'address';
interface PoolRepository {
  skip?: number;
}
interface PoolsRepositoryFetchOptions {
  first?: number;
  skip?: number;
}
interface PoolsFallbackRepositoryOptions {
  timeout?: number;
}

type TokenAttribute = 'address' | 'symbol';
interface TokenProvider {
  find: (address: string) => Promise<Token | undefined>;
  findBy: (
    attribute: TokenAttribute,
    value: string
  ) => Promise<Token | undefined>;
}

interface ProtocolFees {
  swapFee: number;
  yieldFee: number;
}
declare class ProtocolFeesProvider {
  private protocolFeePercentagesProviderAddress;
  multicall: Contract;
  protocolFees?: ProtocolFees;
  constructor(
    multicallAddress: string,
    protocolFeePercentagesProviderAddress: string,
    provider: Provider
  );
  private fetch;
  getFees(): Promise<ProtocolFees>;
}

declare enum PoolGaugesAttributes {
  Id = 'id',
  Address = 'address',
  PoolId = 'poolId',
}
interface PoolGauges {
  preferentialGauge: {
    id: string;
  };
  gauges: {
    id: string;
    relativeWeightCap?: string | null;
  }[];
}

declare enum PoolShareAttributes {
  Balance = 'balance',
  Id = 'id',
  PoolId = 'poolId',
  UserAddress = 'userAddress',
}
interface PoolShare {
  id: string;
  userAddress: string;
  poolId: string;
  balance: string;
}

declare enum GaugeShareAttributes {
  Id = 'id',
  UserAddress = 'user',
  GaugeId = 'gauge',
  Balance = 'balance',
}
interface GaugeShare {
  id: string;
  balance: string;
  userAddress: string;
  gauge: {
    id: string;
    poolId?: string;
    isKilled: boolean;
    totalSupply: string;
  };
}

interface Findable<T, P = string, V = any> {
  find: (id: string) => Promise<T | undefined>;
  findBy: (attribute: P, value: V) => Promise<T | undefined>;
}
interface Searchable<T> {
  all: () => Promise<T[]>;
  where: (filters: (arg: T) => boolean) => Promise<T[]>;
}

/**
 * Weekly Bal emissions are fixed / year according to:
 * https://docs.google.com/spreadsheets/d/1FY0gi596YWBOTeu_mrxhWcdF74SwKMNhmu0qJVgs0KI/edit#gid=0
 *
 * Using regular numbers for simplicity assuming frontend use only.
 *
 * Calculation source
 * https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/liquidity-mining/contracts/BalancerTokenAdmin.sol
 */
declare const INITIAL_RATE = 145000;
declare const START_EPOCH_TIME = 1648465251;
/**
 * Weekly BAL emissions
 *
 * @param currentTimestamp used to get the epoch
 * @returns BAL emitted in a week
 */
declare const weekly: (currentTimestamp?: number) => number;
/**
 * Total BAL emitted in epoch (1 year)
 *
 * @param epoch starting from 0 for the first year of emissions
 * @returns BAL emitted in epoch
 */
declare const total: (epoch: number) => number;
/**
 * Total BAL emitted between two timestamps
 *
 * @param start starting timestamp
 * @param end ending timestamp
 * @returns BAL emitted in period
 */
declare const between: (start: number, end: number) => number;

declare const emissions_INITIAL_RATE: typeof INITIAL_RATE;
declare const emissions_START_EPOCH_TIME: typeof START_EPOCH_TIME;
declare const emissions_weekly: typeof weekly;
declare const emissions_total: typeof total;
declare const emissions_between: typeof between;
declare namespace emissions {
  export {
    emissions_INITIAL_RATE as INITIAL_RATE,
    emissions_START_EPOCH_TIME as START_EPOCH_TIME,
    emissions_weekly as weekly,
    emissions_total as total,
    emissions_between as between,
  };
}

declare abstract class AbstractSubgraphRepository<T, A>
  implements Findable<T, A>
{
  protected abstract mapType(subgraphFragment: any): T;
  abstract query(args: any): Promise<T[]>;
  get(args: any): Promise<T | undefined>;
  find(id: string): Promise<T | undefined>;
  findBy(attribute: A, value: string): Promise<T | undefined>;
  findAllBy(
    attribute: A,
    value: string,
    first?: number,
    skip?: number
  ): Promise<T[]>;
}

declare abstract class BalancerSubgraphRepository<
  T,
  A
> extends AbstractSubgraphRepository<T, A> {
  protected chainId: Network;
  protected blockHeight?: (() => Promise<number | undefined>) | undefined;
  protected client: SubgraphClient;
  constructor(
    url: string,
    chainId: Network,
    blockHeight?: (() => Promise<number | undefined>) | undefined
  );
}

declare abstract class GaugesSubgraphRepository<
  T,
  A
> extends AbstractSubgraphRepository<T, A> {
  protected chainId: Network;
  protected blockHeight?: (() => Promise<number | undefined>) | undefined;
  protected client: GaugesClient;
  constructor(
    url: string,
    chainId: Network,
    blockHeight?: (() => Promise<number | undefined>) | undefined
  );
}

declare class GaugeSharesRepository extends GaugesSubgraphRepository<
  GaugeShare,
  GaugeShareAttributes
> {
  query(args: any): Promise<GaugeShare[]>;
  mapType(subgraphGaugeShare: SubgraphGaugeShareFragment): GaugeShare;
  findByUser(
    userAddress: string,
    first?: number,
    skip?: number
  ): Promise<GaugeShare[]>;
  findByGauge(
    gaugeId: string,
    first?: number,
    skip?: number
  ): Promise<GaugeShare[]>;
}

interface PoolsBalancerAPIOptions {
  url: string;
  apiKey: string;
  query?: GraphQLQuery;
}
/**
 * Access pools using the Balancer GraphQL Api.
 *
 * Balancer's API URL: https://api.balancer.fi/query/
 */
declare class PoolsBalancerAPIRepository
  implements Findable<Pool$1, PoolAttribute>
{
  private client;
  pools: Pool$1[];
  skip: number;
  nextToken: string | undefined | null;
  private query;
  constructor(options: PoolsBalancerAPIOptions);
  private fetchFromCache;
  fetch(options?: PoolsRepositoryFetchOptions): Promise<Pool$1[]>;
  find(id: string): Promise<Pool$1 | undefined>;
  findBy(param: PoolAttribute, value: string): Promise<Pool$1 | undefined>;
  /** Fixes any formatting issues from the subgraph
   *  - GraphQL can't store a map so pool.apr.[rewardAprs/tokenAprs].breakdown
   *    is JSON data that needs to be parsed so they match the Pool type correctly.
   */
  private format;
}

/**
 * The fallback provider takes multiple PoolRepository's in an array and uses them in order
 * falling back to the next one if a request times out.
 *
 * This is useful for using the Balancer API while being able to fall back to the graph if it is down
 * to ensure Balancer is maximally decentralized.
 **/
declare class PoolsFallbackRepository
  implements Findable<Pool$1, PoolAttribute>
{
  private readonly providers;
  currentProviderIdx: number;
  timeout: number;
  constructor(
    providers: PoolRepository[],
    options?: PoolsFallbackRepositoryOptions
  );
  fetch(options?: PoolsRepositoryFetchOptions): Promise<Pool$1[]>;
  get currentProvider(): PoolRepository | undefined;
  find(id: string): Promise<Pool$1 | undefined>;
  findBy(attribute: PoolAttribute, value: string): Promise<Pool$1 | undefined>;
  fallbackQuery(func: string, args: unknown[]): Promise<any>;
}

declare class PoolsStaticRepository
  implements Findable<Pool$1, PoolAttribute>, Searchable<Pool$1>
{
  private pools;
  constructor(pools: Pool$1[]);
  find(id: string): Promise<Pool$1 | undefined>;
  findBy(attribute: PoolAttribute, value: string): Promise<Pool$1 | undefined>;
  all(): Promise<Pool$1[]>;
  where(filter: (pool: Pool$1) => boolean): Promise<Pool$1[]>;
}

interface PoolsSubgraphRepositoryOptions {
  url: string;
  chainId: Network;
  blockHeight?: () => Promise<number | undefined>;
  query?: GraphQLQuery;
}
/**
 * Access pools using generated subgraph client.
 *
 * Balancer's subgraph URL: https://thegraph.com/hosted-service/subgraph/balancer-labs/balancer-v2
 */
declare class PoolsSubgraphRepository
  implements Findable<Pool$1, PoolAttribute>, Searchable<Pool$1>
{
  private client;
  private chainId;
  private pools?;
  skip: number;
  private blockHeight;
  private query;
  /**
   * Repository with optional lazy loaded blockHeight
   *
   * @param url subgraph URL
   * @param chainId current network, needed for L2s logic
   * @param blockHeight lazy loading blockHeigh resolver
   */
  constructor(options: PoolsSubgraphRepositoryOptions);
  /**
   * We need a list of all the pools, for calculating APRs (nested pools), and for SOR (path finding).
   * All the pools are fetched on page load and cachced for speedy lookups.
   *
   * @returns Promise resolving to pools list
   */
  private fetchDefault;
  fetch(options?: PoolsRepositoryFetchOptions): Promise<Pool$1[]>;
  find(id: string): Promise<Pool$1 | undefined>;
  findBy(param: PoolAttribute, value: string): Promise<Pool$1 | undefined>;
  all(): Promise<Pool$1[]>;
  block(): Promise<
    | {
        number: number | undefined;
      }
    | undefined
  >;
  where(filter: (pool: Pool$1) => boolean): Promise<Pool$1[]>;
  private mapType;
  private mapToken;
  private mapSubPools;
  private mapSubPoolToken;
}

interface PoolsSubgraphOnChainRepositoryOptions {
  url: string;
  chainId: Network;
  provider: Provider;
  multicall: string;
  vault: string;
  blockHeight?: () => Promise<number | undefined>;
  query?: GraphQLQuery;
}
/**
 * Access pools using generated subgraph client and multicall.
 */
declare class PoolsSubgraphOnChainRepository
  implements Findable<Pool$1, PoolAttribute>, Searchable<Pool$1>
{
  private poolsSubgraph;
  private provider;
  private pools?;
  private multicall;
  private vault;
  skip: number;
  /**
   * Repository using multicall to get onchain data.
   *
   * @param url subgraph URL
   * @param chainId current network, needed for L2s logic
   * @param blockHeight lazy loading blockHeigh resolver
   * @param multicall multicall address
   * @param valt vault address
   */
  constructor(options: PoolsSubgraphOnChainRepositoryOptions);
  /**
   * We need a list of all the pools, for calculating APRs (nested pools), and for SOR (path finding).
   * All the pools are fetched on page load and cachced for speedy lookups.
   *
   * @returns Promise resolving to pools list
   */
  private fetchDefault;
  fetch(options?: PoolsRepositoryFetchOptions): Promise<Pool$1[]>;
  find(id: string, forceRefresh?: boolean): Promise<Pool$1 | undefined>;
  findBy(
    param: PoolAttribute,
    value: string,
    forceRefresh?: boolean
  ): Promise<Pool$1 | undefined>;
  all(): Promise<Pool$1[]>;
  where(filter: (pool: Pool$1) => boolean): Promise<Pool$1[]>;
}

declare class PoolGaugesRepository extends GaugesSubgraphRepository<
  PoolGauges,
  PoolGaugesAttributes
> {
  query(args: any): Promise<PoolGauges[]>;
  mapType(fragment: any): PoolGauges;
}

declare enum PoolJoinExitAttributes {
  Pool = 'pool',
  Sender = 'sender',
}
interface PoolJoinExit {
  id: string;
  userAddress: string;
  poolId: string;
  timestamp: number;
  type: string;
  amounts: string[];
  tokens: string[];
}

declare class PoolJoinExitRepository extends BalancerSubgraphRepository<
  PoolJoinExit,
  PoolJoinExitAttributes
> {
  query(args: any): Promise<PoolJoinExit[]>;
  mapType(item: SubgraphJoinExitFragment): PoolJoinExit;
  findByUser(
    sender: string,
    first?: number,
    skip?: number
  ): Promise<PoolJoinExit[]>;
  findJoins(sender: string, pool: string): Promise<PoolJoinExit[]>;
  findExits(sender: string, pool: string): Promise<PoolJoinExit[]>;
  findByPool(
    poolId: string,
    first?: number,
    skip?: number
  ): Promise<PoolJoinExit[]>;
}

declare class PoolSharesRepository extends BalancerSubgraphRepository<
  PoolShare,
  PoolShareAttributes
> {
  query(args: any): Promise<PoolShare[]>;
  mapType(subgraphPoolShare: SubgraphPoolShareFragment): PoolShare;
  findByUser(
    userAddress: string,
    first?: number,
    skip?: number
  ): Promise<PoolShare[]>;
  findByPool(
    poolId: string,
    first?: number,
    skip?: number
  ): Promise<PoolShare[]>;
}

declare class StaticTokenProvider implements Findable<Token, TokenAttribute> {
  private tokens;
  constructor(tokens: Token[]);
  find(address: string): Promise<Token | undefined>;
  findBy(attribute: TokenAttribute, value: string): Promise<Token | undefined>;
}

declare const APR_THRESHOLD = 10000;
/**
 * For proportional exits from ComposableStable pools the ExactBPTInForTokensOut
 * exit type was removed. Therefore we have to use BPTInForExactTokensOut which
 * makes proportional exits using a user's total BPT balance impossible. In
 * order to 'fix' this we need to subtract a little bit from the bptIn value
 * when calculating the ExactTokensOut. The variable below is that "little bit".
 */
declare const SHALLOW_COMPOSABLE_STABLE_BUFFER = 1000000;
type FactoryType =
  | 'oracleWeightedPool'
  | 'weightedPool'
  | 'stablePool'
  | 'managedPool'
  | 'liquidityBootstrappingPool'
  | 'boostedPool'
  | 'composableStablePool';
type PoolMetadata = {
  name: string;
  hasIcon: boolean;
};
type NamedPools = {
  staBAL: string;
  bbAaveUSD: {
    v1: string;
    v2: string;
  };
  xMatic: {
    v1: string;
    v2: string;
  };
  stMatic: {
    v1: string;
    v2: string;
  };
  mai4: {
    mai4: string;
    maiBbaUsd: string;
  };
  veBAL: string;
};
type Pools$1 = {
  IdsMap: Partial<NamedPools>;
  Pagination: {
    PerPage: number;
    PerPool: number;
    PerPoolInitial: number;
  };
  DelegateOwner: string;
  ZeroAddress: string;
  DynamicFees: {
    Gauntlet: string[];
  };
  BlockList: string[];
  ExcludedPoolTypes: string[];
  Stable: {
    AllowList: string[];
  };
  Investment: {
    AllowList: string[];
  };
  Factories: Record<string, FactoryType>;
  Stakable: {
    AllowList: string[];
  };
  Metadata: Record<string, PoolMetadata>;
};
declare function POOLS(networkId: Network): Pools$1;

interface TransactionData$1 {
  to: string;
  from: string;
  callData: string;
  tokensOut: string[];
  expectedTokensValue: BigNumber[];
  functionName: string;
}
interface TokenBalance {
  [token: string]: BigNumber;
}
interface IClaimService {
  getClaimableRewardTokens(userAddress: string): Promise<LiquidityGauge[]>;
  buildClaimRewardTokensRequest(
    gaugeAddresses: string[],
    userAddress: string
  ): Promise<TransactionData$1>;
  getClaimableVeBalTokens(
    userAddress: string,
    claimableTokens: string[]
  ): Promise<TokenBalance>;
  buildClaimVeBalTokensRequest(
    userAddress: string,
    claimableTokens: string[]
  ): Promise<TransactionData$1>;
}

interface FeeDistributorData {
  balAmount: number;
  bbAUsdAmount: number;
  veBalSupply: number;
  bbAUsdPrice: number;
  balAddress: string;
}
interface BaseFeeDistributor {
  multicallData: (ts: number) => Promise<FeeDistributorData>;
  getClaimableBalances(
    userAddress: string,
    claimableTokens: string[]
  ): Promise<TokenBalance>;
  claimBalances(userAddress: string, claimableTokens: string[]): string;
}
declare class FeeDistributorRepository implements BaseFeeDistributor {
  private feeDistributorAddress;
  private balAddress;
  private veBalAddress;
  private bbAUsdAddress;
  multicall: Contract;
  feeDistributor: Contract;
  data?: FeeDistributorData;
  constructor(
    multicallAddress: string,
    feeDistributorAddress: string,
    balAddress: string,
    veBalAddress: string,
    bbAUsdAddress: string,
    provider: Provider
  );
  fetch(timestamp: number): Promise<FeeDistributorData>;
  multicallData(timestamp: number): Promise<FeeDistributorData>;
  getPreviousWeek(fromTimestamp: number): number;
  getClaimableBalances(
    userAddress: string,
    claimableTokens: string[]
  ): Promise<TokenBalance>;
  claimBalances(userAddress: string, claimableTokens: string[]): string;
  extractTokenBalance(
    claimableTokens: string[],
    amounts: (BigNumber | undefined | null)[]
  ): TokenBalance;
}

declare class FeeCollectorRepository implements Findable<number> {
  private provider;
  vault: Contract;
  swapFeePercentage?: number;
  constructor(vaultAddress: string, provider: Provider);
  fetch(): Promise<number>;
  find(): Promise<number>;
  findBy(): Promise<number>;
}

/**
 * Common interface for fetching APR from external sources
 * @interal
 *
 * @param network is optional, used when same source, eg: aave has multiple tokens and all of them can be fetched in one call.
 * @param other is optional, used for passing mocked data for testing.
 */
interface AprFetcher {
  (network?: Network, other?: any): Promise<{
    [address: string]: number;
  }>;
}
declare class TokenYieldsRepository implements Findable<number> {
  private network;
  private sources;
  private yields;
  constructor(
    network: Network,
    sources?: {
      [address: string]: AprFetcher;
    }
  );
  fetch(address: string): Promise<void>;
  find(address: string): Promise<number | undefined>;
  findBy(attribute: string, value: string): Promise<number | undefined>;
}

declare class BlockNumberRepository implements Findable<number> {
  private endpoint;
  blocks: {
    [ts: string]: Promise<number>;
  };
  constructor(endpoint: string);
  find(from: string): Promise<number | undefined>;
  findBy(attribute?: string, value?: string): Promise<number | undefined>;
}

declare class SubgraphPoolDataService implements PoolDataService {
  private readonly client;
  private readonly provider;
  private readonly network;
  private readonly sorConfig?;
  private readonly query;
  constructor(
    client: SubgraphClient,
    provider: Provider,
    network: BalancerNetworkConfig,
    sorConfig?: BalancerSdkSorConfig | undefined,
    query?: GraphQLQuery
  );
  getPools(): Promise<SubgraphPoolBase[]>;
  private getSubgraphPools;
}

declare class AaveHelpers {
  static getRate(
    rateProviderAddress: string,
    provider: JsonRpcProvider
  ): Promise<string>;
}

declare class AssetHelpers {
  readonly ETH: string;
  readonly WETH: string;
  constructor(wethAddress: string);
  static isEqual: (addressA: string, addressB: string) => boolean;
  /**
   * Tests whether `token` is ETH (represented by `0x0000...0000`).
   *
   * @param token - the address of the asset to be checked
   */
  isETH: (token: string) => boolean;
  /**
   * Tests whether `token` is WETH.
   *
   * @param token - the address of the asset to be checked
   */
  isWETH: (token: string) => boolean;
  /**
   * Converts an asset to the equivalent ERC20 address.
   *
   * For ERC20s this will return the passed address but passing ETH (`0x0000...0000`) will return the WETH address
   * @param token - the address of the asset to be translated to an equivalent ERC20
   * @returns the address of translated ERC20 asset
   */
  translateToERC20: (token: string) => string;
  /**
   * Sorts an array of token addresses into ascending order to match the format expected by the Vault.
   *
   * Passing additional arrays will result in each being sorted to maintain relative ordering to token addresses.
   *
   * The zero address (representing ETH) is sorted as if it were the WETH address.
   * This matches the behaviour expected by the Vault when receiving an array of addresses.
   *
   * @param tokens - an array of token addresses to be sorted in ascending order
   * @param others - a set of arrays to be sorted in the same order as the tokens, e.g. token weights or asset manager addresses
   * @returns an array of the form `[tokens, ...others]` where each subarray has been sorted to maintain its ordering relative to `tokens`
   *
   * @example
   * const [tokens] = sortTokens([tokenB, tokenC, tokenA])
   * const [tokens, weights] = sortTokens([tokenB, tokenC, tokenA], [weightB, weightC, weightA])
   * // where tokens = [tokenA, tokenB, tokenC], weights = [weightA, weightB, weightC]
   */
  sortTokens(
    tokens: string[],
    ...others: unknown[][]
  ): [string[], ...unknown[][]];
}

declare class BalancerErrors {
  /**
   * Cannot be constructed.
   */
  private constructor();
  static isErrorCode: (error: string) => boolean;
  /**
   * Decodes a Balancer error code into the corresponding reason
   * @param error - a Balancer error code of the form `BAL#000`
   * @returns The decoded error reason
   */
  static parseErrorCode: (error: string) => string;
  /**
   * Decodes a Balancer error code into the corresponding reason
   * @param error - a Balancer error code of the form `BAL#000`
   * @returns The decoded error reason if passed a valid error code, otherwise returns passed input
   */
  static tryParseErrorCode: (error: string) => string;
  /**
   * Tests whether a string is a known Balancer error message
   * @param error - a string to be checked verified as a Balancer error message
   */
  static isBalancerError: (error: string) => boolean;
  /**
   * Encodes an error string into the corresponding error code
   * @param error - a Balancer error message string
   * @returns a Balancer error code of the form `BAL#000`
   */
  static encodeError: (error: string) => string;
}

type Account = string | Signer | Contract;
declare function accountToAddress(account: Account): Promise<string>;
declare enum RelayerAction {
  JoinPool = 'JoinPool',
  ExitPool = 'ExitPool',
  Swap = 'Swap',
  BatchSwap = 'BatchSwap',
  SetRelayerApproval = 'SetRelayerApproval',
}
declare class RelayerAuthorization {
  /**
   * Cannot be constructed.
   */
  private constructor();
  static encodeCalldataAuthorization: (
    calldata: string,
    deadline: BigNumberish,
    signature: string
  ) => string;
  static signJoinAuthorization: (
    validator: Contract,
    user: Signer & TypedDataSigner,
    allowedSender: Account,
    allowedCalldata: string,
    deadline?: BigNumberish,
    nonce?: BigNumberish
  ) => Promise<string>;
  static signExitAuthorization: (
    validator: Contract,
    user: Signer & TypedDataSigner,
    allowedSender: Account,
    allowedCalldata: string,
    deadline?: BigNumberish,
    nonce?: BigNumberish
  ) => Promise<string>;
  static signSwapAuthorization: (
    validator: Contract,
    user: Signer & TypedDataSigner,
    allowedSender: Account,
    allowedCalldata: string,
    deadline?: BigNumberish,
    nonce?: BigNumberish
  ) => Promise<string>;
  static signBatchSwapAuthorization: (
    validator: Contract,
    user: Signer & TypedDataSigner,
    allowedSender: Account,
    allowedCalldata: string,
    deadline?: BigNumberish,
    nonce?: BigNumberish
  ) => Promise<string>;
  static signSetRelayerApprovalAuthorization: (
    validator: Contract,
    user: Signer & TypedDataSigner,
    allowedSender: Account,
    allowedCalldata: string,
    deadline?: BigNumberish,
    nonce?: BigNumberish
  ) => Promise<string>;
  static signAuthorizationFor: (
    type: RelayerAction,
    validator: Contract,
    user: Signer & TypedDataSigner,
    allowedSender: Account,
    allowedCalldata: string,
    deadline?: BigNumberish,
    nonce?: BigNumberish
  ) => Promise<string>;
}
declare class BalancerMinterAuthorization {
  /**
   * Cannot be constructed.
   */
  private constructor();
  static signSetMinterApproval: (
    minterContract: Contract,
    minter: Account,
    approval: boolean,
    user: Signer & TypedDataSigner,
    deadline?: BigNumberish,
    nonce?: BigNumberish
  ) => Promise<{
    v: number;
    r: string;
    s: string;
    deadline: BigNumber;
  }>;
}

declare const signPermit: (
  token: Contract,
  owner: Signer & TypedDataSigner,
  spender: Account,
  amount: BigNumberish,
  deadline?: BigNumberish,
  nonce?: BigNumberish
) => Promise<{
  v: number;
  r: string;
  s: string;
  deadline: BigNumber;
  nonce: BigNumber;
}>;

interface ParsedPoolInfo {
  parsedTokens: string[];
  parsedDecimals: string[];
  parsedBalances: string[];
  parsedWeights: string[];
  parsedPriceRates: string[];
  parsedAmp: string;
  parsedTotalShares: string;
  parsedSwapFee: string;
  upScaledBalances: string[];
  scalingFactors: bigint[];
  scalingFactorsWithoutBpt: bigint[];
  parsedTokensWithoutBpt: string[];
  parsedBalancesWithoutBpt: string[];
  bptIndex: number;
  parsedPriceRatesWithoutBpt: string[];
  upScaledBalancesWithoutBpt: string[];
}
/**
 * Parse pool info into EVM amounts. Sorts by token order if wrappedNativeAsset param passed.
 * @param {Pool}  pool
 * @param {string}  wrappedNativeAsset
 * @param unwrapNativeAsset if true, changes wETH address to ETH address
 * @returns       parsed pool info
 */
declare const parsePoolInfo: (
  pool: Pool$1,
  wrappedNativeAsset?: string,
  unwrapNativeAsset?: boolean
) => ParsedPoolInfo;

declare function tokensToTokenPrices(tokens: Token[]): TokenPrices$1;
declare function tokenAddressForPricing(
  address: string,
  chainId: Network
): string;
/**
 * Maps testnet tokens, eg: on Göreli to a mainnet one.
 * Used to get the pricing information on networks not supported by a price feed.
 *
 * @param address Address on a testnet network
 */
declare const addressMapIn: (address: string, chainId: Network) => string;
/**
 * Finds an underlying token address for a wrapped one
 *
 * @param wrappedAddress
 * @param chainId
 * @returns underlying token address
 */
declare const unwrapToken: (wrappedAddress: string, chainId: Network) => string;
declare const getEthValue: (
  tokens: string[],
  amounts: string[]
) => BigNumber | undefined;

/**
 * Debouncer for different attributes requested over time, which need to be aggregated into a single resolving call
 *
 * Choosing deferred promise since we have setTimeout that returns a promise
 * Some reference for history buffs: https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns
 */
interface Promised<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}
/**
 * Aggregates attributes and exectutes a debounced call
 *
 * @param fn Function to debounce
 * @param wait Debouncing waiting time [ms]
 */
declare class Debouncer<T, A> {
  private fn;
  private wait;
  requestSet: Set<A>;
  promisedCalls: Promised<T>[];
  promisedCount: number;
  timeout?: ReturnType<typeof setTimeout>;
  debounceCancel: () => void;
  constructor(fn: (attrs: A[]) => Promise<T>, wait?: number);
  fetch(attr?: A): Promise<T>;
}

declare function parseFixed(value: string, decimals?: BigNumberish): BigNumber;
declare function formatFixed(value: BigNumber, decimals: BigNumberish): string;
declare function parseToBigInt18(value: string): bigint;
declare function formatFromBigInt18(value: bigint): string;
/**
 * Like parseEther but for numbers. Converts floating point to BigNumber using 18 decimals
 */
declare const bn: (value: number) => BigNumber;

declare const isSameAddress: (address1: string, address2: string) => boolean;
declare function insert<T>(arr: T[], index: number, newItem: T): T[];
/**
 * Replace the item on the specified index with newItem
 * @param arr
 * @param index
 * @param newItem
 */
declare function replace<T>(arr: T[], index: number, newItem: T): T[];
/**
 * Removes item from array at specified index and returns new array. (Does not mutate original)
 * @param arr Original array
 * @param index Index of item to be removed
 * @returns New array with item at index removed
 */
declare function removeItem<T>(arr: T[], index: number): T[];
/**
 * REORDER ARRAYS USING A REFERENCE AND ORIGINAL ARRAY,
 * Example:
 * Input -> reference: [c,b,a], original: [a,b,c], others: [[1,2,3], [4,5,6]]
 * Sorts like -> [[c,b,a],[3,2,1],[6,5,4]]
 * Returns -> [6,5,4]
 * @param reference
 * @param original
 * @param others
 * @returns Sorted others
 */
declare function reorderArrays<T>(
  reference: T[],
  original: T[],
  ...others: unknown[][]
): unknown[][];
declare function isLinearish(poolType: string): boolean;

interface IAaveRates {
  getRate: (address: string) => Promise<number>;
}

declare class TokenPriceProvider implements Findable<Price> {
  private coingeckoRepository;
  private subgraphRepository;
  private aaveRates;
  constructor(
    coingeckoRepository: Findable<Price>,
    subgraphRepository: Findable<Price>,
    aaveRates: IAaveRates
  );
  find(address: string): Promise<Price | undefined>;
  findBy(attribute: string, value: string): Promise<Price | undefined>;
}

declare class HistoricalPriceProvider implements Findable<Price> {
  private coingeckoRepository;
  private aaveRates;
  constructor(coingeckoRepository: Findable<Price>, aaveRates: IAaveRates);
  /**
   * get the historical price at time of call
   *
   * @param address the token address
   */
  find(address: string): Promise<Price | undefined>;
  /**
   * get the historical price at the given timestamp.
   *
   * @param address the token address
   * @param timestamp the UNIX timestamp
   * @private
   */
  findBy(address: string, timestamp: number): Promise<Price | undefined>;
}

declare class Data implements BalancerDataRepositories {
  pools: PoolsSubgraphRepository;
  poolsForSor: SubgraphPoolDataService;
  poolsOnChain: PoolsSubgraphOnChainRepository;
  yesterdaysPools: PoolsSubgraphRepository | undefined;
  poolShares: PoolSharesRepository;
  poolGauges: PoolGaugesRepository | undefined;
  gaugeShares: GaugeSharesRepository | undefined;
  tokenPrices: TokenPriceProvider;
  tokenHistoricalPrices: HistoricalPriceProvider;
  tokenMeta: StaticTokenProvider;
  liquidityGauges: LiquidityGaugeSubgraphRPCProvider | undefined;
  feeDistributor: FeeDistributorRepository | undefined;
  feeCollector: FeeCollectorRepository;
  protocolFees: ProtocolFeesProvider | undefined;
  tokenYields: TokenYieldsRepository;
  blockNumbers: BlockNumberRepository | undefined;
  poolJoinExits: PoolJoinExitRepository;
  constructor(
    networkConfig: BalancerNetworkConfig,
    provider: Provider,
    subgraphQuery?: GraphQLQuery
  );
}

type GraphQLFilterOperator = 'gt' | 'lt' | 'eq' | 'in' | 'not_in' | 'contains';
type GraphQLFilter = {
  [operator in GraphQLFilterOperator]?: any;
};
interface GraphQLArgs {
  chainId?: number;
  first?: number;
  skip?: number;
  nextToken?: string;
  orderBy?: string;
  orderDirection?: string;
  block?: {
    number?: number;
  };
  where?: Record<string, GraphQLFilter>;
}
interface GraphQLArgsFormatter {
  format(args: GraphQLArgs): unknown;
}

declare class BalancerAPIArgsFormatter implements GraphQLArgsFormatter {
  format(args: GraphQLArgs): GraphQLArgs;
}

declare class SubgraphArgsFormatter implements GraphQLArgsFormatter {
  operatorMap: Record<string, string>;
  constructor();
  format(args: GraphQLArgs): GraphQLArgs;
}

declare class GraphQLArgsBuilder {
  readonly args: GraphQLArgs;
  constructor(args: GraphQLArgs);
  merge(other: GraphQLArgsBuilder): GraphQLArgsBuilder;
  format(formatter: GraphQLArgsFormatter): unknown;
}

interface AprBreakdown {
  swapFees: number;
  tokenAprs: {
    total: number;
    breakdown: {
      [address: string]: number;
    };
  };
  stakingApr: {
    min: number;
    max: number;
  };
  rewardAprs: {
    total: number;
    breakdown: {
      [address: string]: number;
    };
  };
  protocolApr: number;
  min: number;
  max: number;
}
/**
 * Calculates pool APR via summing up sources of APR:
 *
 * 1. Swap fees (pool level) data coming from subgraph
 * 2. Yield bearing pool tokens, with data from external sources eg: http endpoints, subgraph, onchain
 *    * stETH
 *    * aave
 *    * usd+
 *    map token: calculatorFn
 * 3. Staking rewards based from veBal gauges
 */
declare class PoolApr {
  private pools;
  private tokenPrices;
  private tokenMeta;
  private tokenYields;
  private feeCollector;
  private yesterdaysPools?;
  private liquidityGauges?;
  private feeDistributor?;
  constructor(
    pools: Findable<Pool$1, PoolAttribute>,
    tokenPrices: Findable<Price>,
    tokenMeta: Findable<Token, TokenAttribute>,
    tokenYields: Findable<number>,
    feeCollector: Findable<number>,
    yesterdaysPools?: Findable<Pool$1, PoolAttribute, any> | undefined,
    liquidityGauges?: Findable<LiquidityGauge, string, any> | undefined,
    feeDistributor?: BaseFeeDistributor | undefined
  );
  /**
   * Pool revenue via swap fees.
   * Fees and liquidity are takes from subgraph as USD floats.
   *
   * @returns APR [bsp] from fees accumulated over last 24h
   */
  swapFees(pool: Pool$1): Promise<number>;
  /**
   * Pool revenue from holding yield-bearing wrapped tokens.
   *
   * @returns APR [bsp] from tokens contained in the pool
   */
  tokenAprs(pool: Pool$1): Promise<AprBreakdown['tokenAprs']>;
  /**
   * Calculates staking rewards based on veBal gauges deployed with Curve Finance contracts.
   * https://curve.readthedocs.io/dao-gauges.html
   *
   * Terminology:
   *  - LP token of a gauge is a BPT of a pool
   *  - Depositing into a gauge is called staking on the frontend
   *  - gauge totalSupply - BPT tokens deposited to a gauge
   *  - gauge workingSupply - effective BPT tokens participating in reward distribution. sum of 40% deposit + 60% boost from individual user's veBal
   *  - gauge relative weight - weight of this gauge in bal inflation distribution [0..1] scaled to 1e18
   *
   * APR sources:
   *  - gauge BAL emissions = min: 40% of totalSupply, max: 40% of totalSupply + 60% of totalSupply * gauge LPs voting power
   *    https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/liquidity-mining/contracts/gauges/ethereum/LiquidityGaugeV5.vy#L338
   *  - gauge reward tokens: Admin or designated depositor has an option to deposit additional reward with a weekly accruing cadence.
   *    https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/liquidity-mining/contracts/gauges/ethereum/LiquidityGaugeV5.vy#L641
   *    rate: amount of token per second
   *
   * @param pool
   * @param boost range between 1 and 2.5
   * @returns APR [bsp] from protocol rewards.
   */
  stakingApr(pool: Pool$1, boost?: number): Promise<number>;
  /**
   * Some gauges are holding tokens distributed as rewards to LPs.
   *
   * @param pool
   * @returns APR [bsp] from token rewards.
   */
  rewardAprs(pool: Pool$1): Promise<AprBreakdown['rewardAprs']>;
  /**
   * 80BAL-20WETH pool is accruing protocol revenue.
   *
   * @param pool
   * @returns accrued protocol revenue as APR [bsp]
   */
  protocolApr(pool: Pool$1): Promise<number>;
  /**
   * Composes all sources for total pool APR.
   *
   * @returns pool APR split [bsp]
   */
  apr(pool: Pool$1): Promise<AprBreakdown>;
  private last24hFees;
  /**
   * Total Liquidity based on USD token prices taken from external price feed, eg: coingecko.
   *
   * @param pool
   * @returns Pool liquidity in USD
   */
  private totalLiquidity;
  /**
   * BPT price as pool totalLiquidity / pool total Shares
   * Total Liquidity is calculated based on USD token prices taken from external price feed, eg: coingecko.
   *
   * @param pool
   * @returns BPT price in USD
   */
  private bptPrice;
  private protocolSwapFeePercentage;
  private rewardTokenApr;
}

interface ParamsBuilder {
  buildQueryJoinExactIn(params: JoinExactInParams): queryJoinParams;
  buildQueryJoinExactOut(params: JoinExactOutParams): queryJoinParams;
  buildQueryExitToSingleToken(params: ExitToSingleTokenParams): queryExitParams;
  buildQueryExitProportionally(
    params: ExitProportionallyParams
  ): queryExitParams;
  buildQueryExitExactOut(params: ExitExactOutParams): queryExitParams;
}
interface JoinExactInParams {
  sender?: string;
  recipient?: string;
  maxAmountsIn: BigNumber[];
  minimumBPT?: BigNumber;
  fromInternalBalance?: boolean;
}
interface JoinExactOutParams {
  sender?: string;
  recipient?: string;
  maxAmountsIn?: BigNumber[];
  bptOut: BigNumber;
  tokenIn: string;
  fromInternalBalance?: boolean;
}
interface ExitToSingleTokenParams {
  sender?: string;
  recipient?: string;
  minAmountsOut?: BigNumber[];
  bptIn: BigNumber;
  tokenOut: string;
  toInternalBalance?: boolean;
}
interface ExitProportionallyParams {
  sender?: string;
  recipient?: string;
  minAmountsOut?: BigNumber[];
  bptIn: BigNumber;
  toInternalBalance?: boolean;
}
interface ExitExactOutParams {
  sender?: string;
  recipient?: string;
  minAmountsOut: BigNumber[];
  maxBptIn?: BigNumber;
  toInternalBalance?: boolean;
}
type queryJoinParams = [
  poolId: string,
  sender: string,
  recipient: string,
  request: {
    assets: string[];
    maxAmountsIn: BigNumber[];
    userData: string;
    fromInternalBalance: boolean;
  }
];
type queryExitParams = [
  poolId: string,
  sender: string,
  recipient: string,
  request: {
    assets: string[];
    minAmountsOut: BigNumber[];
    userData: string;
    toInternalBalance: boolean;
  }
];

type Address$1 = string;
interface BalancerSdkConfig {
  network: Network | BalancerNetworkConfig;
  rpcUrl: string;
  customSubgraphUrl?: string;
  subgraphQuery?: GraphQLQuery;
  sor?: Partial<BalancerSdkSorConfig>;
  tenderly?: BalancerTenderlyConfig;
}
interface BalancerTenderlyConfig {
  accessKey?: string;
  user?: string;
  project?: string;
  blockNumber?: number;
}
interface BalancerSdkSorConfig {
  tokenPriceService: 'coingecko' | 'subgraph' | TokenPriceService;
  poolDataService: 'subgraph' | PoolDataService;
  fetchOnChainBalances: boolean;
}
interface ContractAddresses {
  vault: string;
  multicall: string;
  gaugeClaimHelper?: string;
  balancerHelpers: string;
  balancerMinterAddress?: string;
  lidoRelayer?: string;
  relayerV3?: string;
  relayerV4?: string;
  gaugeController?: string;
  feeDistributor?: string;
  veBal?: string;
  veBalProxy?: string;
  protocolFeePercentagesProvider?: string;
  weightedPoolFactory?: string;
  composableStablePoolFactory?: string;
}
interface BalancerNetworkConfig {
  chainId: Network;
  addresses: {
    contracts: ContractAddresses;
    tokens: {
      wrappedNativeAsset: string;
      lbpRaisingTokens?: string[];
      stETH?: string;
      wstETH?: string;
      bal?: string;
      veBal?: string;
      bbaUsd?: string;
    };
  };
  tenderly?: BalancerTenderlyConfig;
  urls: {
    subgraph: string;
    gaugesSubgraph?: string;
    blockNumberSubgraph?: string;
  };
  pools: {
    wETHwstETH?: PoolReference;
  };
  poolsToIgnore?: string[];
  sorConnectingTokens?: {
    symbol: string;
    address: string;
  }[];
}
interface BalancerDataRepositories {
  pools: Findable<Pool$1, PoolAttribute> & Searchable<Pool$1>;
  poolsForSor: SubgraphPoolDataService;
  poolsOnChain: Findable<Pool$1, PoolAttribute> & Searchable<Pool$1>;
  yesterdaysPools?: Findable<Pool$1, PoolAttribute> & Searchable<Pool$1>;
  tokenPrices: Findable<Price>;
  tokenHistoricalPrices: Findable<Price>;
  tokenMeta: Findable<Token, TokenAttribute>;
  liquidityGauges?: Findable<LiquidityGauge>;
  feeDistributor?: BaseFeeDistributor;
  feeCollector: Findable<number>;
  protocolFees?: ProtocolFeesProvider;
  tokenYields: Findable<number>;
  poolShares: PoolSharesRepository;
  poolGauges?: PoolGaugesRepository;
  poolJoinExits: PoolJoinExitRepository;
  gaugeShares?: GaugeSharesRepository;
}
type PoolReference = {
  id: string;
  address: string;
};
declare enum PoolSpecialization {
  GeneralPool = 0,
  MinimalSwapInfoPool = 1,
  TwoTokenPool = 2,
}
type JoinPoolRequest$1 = {
  assets: string[];
  maxAmountsIn: BigNumberish[];
  userData: string;
  fromInternalBalance: boolean;
};
type ExitPoolRequest$1 = {
  assets: string[];
  minAmountsOut: string[];
  userData: string;
  toInternalBalance: boolean;
};
declare enum UserBalanceOpKind {
  DepositInternal = 0,
  WithdrawInternal = 1,
  TransferInternal = 2,
  TransferExternal = 3,
}
type UserBalanceOp = {
  kind: UserBalanceOpKind;
  asset: string;
  amount: BigNumberish;
  sender: string;
  recipient: string;
};
declare enum PoolBalanceOpKind {
  Withdraw = 0,
  Deposit = 1,
  Update = 2,
}
type PoolBalanceOp = {
  kind: PoolBalanceOpKind;
  poolId: string;
  token: string;
  amount: BigNumberish;
};
interface TransactionData {
  contract?: Contract;
  function: string;
  params: string[];
  outputs?: {
    amountsIn?: string[];
    amountsOut?: string[];
  };
}
type Currency = 'eth' | 'usd';
type Price = {
  [currency in Currency]?: string;
};
type TokenPrices$1 = {
  [address: string]: Price;
};
type HistoricalPrices = {
  prices: [[number, number]];
  market_caps: [[number, number]];
  total_volumes: [[number, number]];
};
interface Token {
  address: string;
  decimals?: number;
  symbol?: string;
  price?: Price;
}
interface PoolToken extends Token {
  balance: string;
  priceRate?: string;
  weight?: string | null;
  isExemptFromYieldProtocolFee?: boolean;
  token?: SubPoolMeta;
}
interface SubPoolMeta {
  pool: SubPool | null;
  latestUSDPrice?: string;
}
interface SubPool {
  id: string;
  address: string;
  poolType: PoolType;
  totalShares: string;
  mainIndex: number;
  tokens?: PoolToken[];
}
interface OnchainTokenData {
  balance: string;
  weight: number;
  decimals: number;
  logoURI: string | undefined;
  name: string;
  symbol: string;
}
interface OnchainPoolData {
  tokens: Record<Address$1, OnchainTokenData>;
  totalSupply: string;
  decimals: number;
  swapFee: string;
  amp?: string;
  swapEnabled: boolean;
  tokenRates?: string[];
}
declare enum PoolType {
  Weighted = 'Weighted',
  Investment = 'Investment',
  Stable = 'Stable',
  ComposableStable = 'ComposableStable',
  MetaStable = 'MetaStable',
  StablePhantom = 'StablePhantom',
  LiquidityBootstrapping = 'LiquidityBootstrapping',
  Element = 'Element',
  Gyro2 = 'Gyro2',
  Gyro3 = 'Gyro3',
  Managed = 'Managed',
  AaveLinear = 'AaveLinear',
  Linear = 'Linear',
  EulerLinear = 'EulerLinear',
  ERC4626Linear = 'ERC4626Linear',
  BeefyLinear = 'BeefyLinear',
  GearboxLinear = 'GearboxLinear',
  MidasLinear = 'MidasLinear',
  ReaperLinear = 'ReaperLinear',
  SiloLinear = 'SiloLinear',
  TetuLinear = 'TetuLinear',
  YearnLinear = 'YearnLinear',
}
interface Pool$1 {
  id: string;
  name: string;
  address: string;
  chainId: number;
  poolType: PoolType;
  poolTypeVersion: number;
  swapFee: string;
  protocolYieldFeeCache: string;
  protocolSwapFeeCache: string;
  owner?: string;
  factory?: string;
  tokens: PoolToken[];
  tokensList: string[];
  tokenAddresses?: string[];
  totalLiquidity: string;
  totalShares: string;
  totalSwapFee?: string;
  totalSwapVolume?: string;
  onchain?: OnchainPoolData;
  createTime?: number;
  mainTokens?: string[];
  wrappedTokens?: string[];
  unwrappedTokens?: string[];
  isNew?: boolean;
  volumeSnapshot?: string;
  feesSnapshot?: string;
  boost?: string;
  symbol?: string;
  swapEnabled: boolean;
  amp?: string;
  wrappedIndex?: number;
  mainIndex?: number;
  apr?: AprBreakdown;
  liquidity?: string;
  totalWeight: string;
  lowerTarget: string;
  upperTarget: string;
  priceRateProviders?: PriceRateProvider[];
}
interface PriceRateProvider {
  address: string;
  token: {
    address: string;
  };
}
/**
 * Pool use-cases / controller layer
 */
interface PoolWithMethods extends Pool$1, ParamsBuilder {
  buildJoin: (
    joiner: string,
    tokensIn: string[],
    amountsIn: string[],
    slippage: string
  ) => JoinPoolAttributes;
  calcPriceImpact: (
    amountsIn: string[],
    minBPTOut: string,
    isJoin: boolean
  ) => Promise<string>;
  buildExitExactBPTIn: (
    exiter: string,
    bptIn: string,
    slippage: string,
    shouldUnwrapNativeAsset?: boolean,
    singleTokenMaxOut?: string
  ) => ExitExactBPTInAttributes;
  buildExitExactTokensOut: (
    exiter: string,
    tokensOut: string[],
    amountsOut: string[],
    slippage: string
  ) => ExitExactTokensOutAttributes;
  calcSpotPrice: (tokenIn: string, tokenOut: string) => string;
  bptIndex: number;
}
interface GraphQLQuery {
  args: GraphQLArgs;
  attrs: any;
}

/**
 * Splits a poolId into its components, i.e. pool address, pool specialization and its nonce
 * @param poolId - a bytes32 string of the pool's ID
 * @returns an object with the decomposed poolId
 */
declare const splitPoolId: (poolId: string) => {
  address: string;
  specialization: PoolSpecialization;
  nonce: BigNumber;
};
/**
 * Extracts a pool's address from its poolId
 * @param poolId - a bytes32 string of the pool's ID
 * @returns the pool's address
 */
declare const getPoolAddress: (poolId: string) => string;
/**
 * Extracts a pool's specialization from its poolId
 * @param poolId - a bytes32 string of the pool's ID
 * @returns the pool's specialization
 */
declare const getPoolSpecialization: (poolId: string) => PoolSpecialization;
/**
 * Extracts a pool's nonce from its poolId
 * @param poolId - a bytes32 string of the pool's ID
 * @returns the pool's nonce
 */
declare const getPoolNonce: (poolId: string) => BigNumber;

declare enum SwapType {
  SwapExactIn = 0,
  SwapExactOut = 1,
}
type FundManagement = {
  sender: string;
  recipient: string;
  fromInternalBalance: boolean;
  toInternalBalance: boolean;
};
type SingleSwap = {
  poolId: string;
  kind: SwapType;
  assetIn: string;
  assetOut: string;
  amount: BigNumberish;
  userData: string;
};
type Swap = {
  request: SingleSwap;
  funds: FundManagement;
  limit: BigNumberish;
  deadline: BigNumberish;
  value?: BigNumberish;
  outputReference?: BigNumberish;
};
type BatchSwapStep = {
  poolId: string;
  assetInIndex: number;
  assetOutIndex: number;
  amount: string;
  userData: string;
};
type BatchSwap = {
  kind: SwapType;
  swaps: BatchSwapStep[];
  assets: string[];
  funds: FundManagement;
  limits: BigNumberish[];
  deadline: BigNumberish;
  value?: BigNumberish;
  outputReferences?: {
    index: BigNumberish;
    key: BigNumberish;
  }[];
};
interface FetchPoolsInput {
  fetchPools: boolean;
  fetchOnChain: boolean;
}
interface QueryWithSorInput {
  tokensIn: string[];
  tokensOut: string[];
  swapType: SwapType;
  amounts: string[];
  fetchPools: FetchPoolsInput;
}
interface SwapInput {
  tokenIn: string;
  tokenOut: string;
  swapType: SwapType;
  amount: string;
}
interface QueryWithSorOutput {
  returnAmounts: string[];
  swaps: BatchSwapStep[];
  assets: string[];
  deltas: string[];
}
interface QuerySimpleFlashSwapParameters {
  poolIds: string[];
  assets: BatchSwap['assets'];
  flashLoanAmount: string;
  vaultContract: Vault;
}
interface SimpleFlashSwapParameters {
  poolIds: string[];
  assets: BatchSwap['assets'];
  flashLoanAmount: string;
  walletAddress: string;
}
interface QuerySimpleFlashSwapResponse {
  profits: Record<string, string>;
  isProfitable: boolean;
}
interface FindRouteParameters {
  tokenIn: string;
  tokenOut: string;
  amount: BigNumber;
  gasPrice: BigNumber;
  maxPools: number;
}
interface BuildTransactionParameters {
  userAddress: string;
  recipient?: string;
  swapInfo: SwapInfo;
  kind: SwapType;
  deadline: BigNumber;
  maxSlippage: number;
}
interface SwapTransactionRequest {
  to: string;
  data: string;
  value?: BigNumber;
}
interface SwapAttributes {
  to: string;
  functionName: string;
  attributes: Swap | BatchSwap;
  data: string;
  value?: BigNumber;
}

/**
 * Helper to create limits using a defined slippage amount.
 * @param tokensIn - Array of token in addresses.
 * @param tokensOut - Array of token out addresses.
 * @param swapType - Type of swap - SwapExactIn or SwapExactOut
 * @param deltas - An array with the net Vault asset balance deltas. Positive amounts represent tokens (or ETH) sent to the Vault, and negative amounts represent tokens (or ETH) sent by the Vault. Each delta corresponds to the asset at the same index in the `assets` array.
 * @param assets - array contains the addresses of all assets involved in the swaps.
 * @param slippage - Slippage to be applied. i.e. 5%=50000000000000000.
 * @returns Returns an array (same length as assets) with limits applied for each asset.
 */
declare function getLimitsForSlippage(
  tokensIn: string[],
  tokensOut: string[],
  swapType: SwapType,
  deltas: BigNumberish[],
  assets: string[],
  slippage: BigNumberish
): BigNumberish[];

interface PoolBPTValue {
  address: string;
  liquidity: string;
}
declare class Liquidity {
  private pools;
  private tokenPrices;
  constructor(
    pools: Findable<Pool$1, PoolAttribute>,
    tokenPrices: Findable<Price>
  );
  getLiquidity(pool: Pool$1): Promise<string>;
}

declare class Swaps {
  readonly sor: SOR;
  chainId: number;
  vaultContract: Vault;
  constructor(sorOrConfig: SOR | BalancerSdkConfig);
  static getLimitsForSlippage(
    tokensIn: string[],
    tokensOut: string[],
    swapType: SwapType,
    deltas: string[],
    assets: string[],
    slippage: string
  ): string[];
  /**
   * Uses SOR to find optimal route for a trading pair and amount
   *
   * @param FindRouteParameters
   * @param FindRouteParameters.tokenIn Address
   * @param FindRouteParameters.tokenOut Address
   * @param FindRouteParameters.amount BigNumber with a trade amount
   * @param FindRouteParameters.gasPrice BigNumber current gas price
   * @param FindRouteParameters.maxPools number of pool included in path
   * @returns Best trade route information
   */
  findRouteGivenIn({
    tokenIn,
    tokenOut,
    amount,
    gasPrice,
    maxPools,
  }: FindRouteParameters): Promise<SwapInfo>;
  /**
   * Uses SOR to find optimal route for a trading pair and amount
   *
   * @param FindRouteParameters
   * @param FindRouteParameters.tokenIn Address
   * @param FindRouteParameters.tokenOut Address
   * @param FindRouteParameters.amount BigNumber with a trade amount
   * @param FindRouteParameters.gasPrice BigNumber current gas price
   * @param FindRouteParameters.maxPools number of pool included in path
   * @returns Best trade route information
   */
  findRouteGivenOut({
    tokenIn,
    tokenOut,
    amount,
    gasPrice,
    maxPools,
  }: FindRouteParameters): Promise<SwapInfo>;
  /**
   * Uses SOR to find optimal route for a trading pair and amount
   *
   * @param BuildTransactionParameters
   * @param BuildTransactionParameters.userAddress Address
   * @param BuildTransactionParameters.swapInfo result of route finding
   * @param BuildTransactionParameters.kind 0 - givenIn, 1 - givenOut
   * @param BuildTransactionParameters.deadline BigNumber block timestamp
   * @param BuildTransactionParameters.maxSlippage [bps], eg: 1 === 0.01%, 100 === 1%
   * @returns transaction request ready to send with signer.sendTransaction
   */
  buildSwap({
    userAddress,
    recipient,
    swapInfo,
    kind,
    deadline,
    maxSlippage,
  }: BuildTransactionParameters): SwapAttributes;
  /**
   * Encode batchSwap in an ABI byte string
   *
   * [See method for a batchSwap](https://dev.balancer.fi/references/contracts/apis/the-vault#batch-swaps).
   *
   * _NB: This method doesn't execute a batchSwap -- it returns an [ABI byte string](https://docs.soliditylang.org/en/latest/abi-spec.html)
   * containing the data of the function call on a contract, which can then be sent to the network to be executed.
   * (ex. [sendTransaction](https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html#sendtransaction)).
   *
   * @param {BatchSwap}           batchSwap - BatchSwap information used for query.
   * @param {SwapType}            batchSwap.kind - either exactIn or exactOut
   * @param {BatchSwapSteps[]}    batchSwap.swaps - sequence of swaps
   * @param {string[]}            batchSwap.assets - array contains the addresses of all assets involved in the swaps
   * @param {FundManagement}      batchSwap.funds - object containing information about where funds should be taken/sent
   * @param {number[]}            batchSwap.limits - limits for each token involved in the swap, where either the maximum number of tokens to send (by passing a positive value) or the minimum amount of tokens to receive (by passing a negative value) is specified
   * @param {string}              batchSwap.deadline -  time (in Unix timestamp) after which it will no longer attempt to make a trade
   * @returns {string}            encodedBatchSwapData - Returns an ABI byte string containing the data of the function call on a contract
   */
  static encodeBatchSwap(batchSwap: BatchSwap): string;
  /**
   * Encode simple flash swap into a ABI byte string
   *
   * A "simple" flash swap is an arbitrage executed with only two tokens and two pools,
   * swapping in the first pool and then back in the second pool for a profit. For more
   * complex flash swaps, you will have to use the batch swap method.
   *
   * Learn more: A [Flash Swap](https://dev.balancer.fi/resources/swaps/flash-swaps).
   *
   * @param {SimpleFlashSwapParameters}   params - BatchSwap information used for query.
   * @param {string}                      params.flashLoanAmount - initial input amount for the flash loan (first asset)
   * @param {string[]}                    params.poolIds - array of Balancer pool ids
   * @param {string[]}                    params.assets - array of token addresses
   * @param {string}                      params.walletAddress - array of token addresses
   * @returns {string}                    encodedBatchSwapData - Returns an ABI byte string containing the data of the function call on a contract
   */
  static encodeSimpleFlashSwap(params: SimpleFlashSwapParameters): string;
  /**
   * fetchPools saves updated pools data to SOR internal onChainBalanceCache.
   * @param {SubgraphPoolBase[]} [poolsData=[]] If poolsData passed uses this as pools source otherwise fetches from config.subgraphUrl.
   * @param {boolean} [isOnChain=true] If isOnChain is true will retrieve all required onChain data via multicall otherwise uses subgraph values.
   * @returns {boolean} Boolean indicating whether pools data was fetched correctly (true) or not (false).
   */
  fetchPools(): Promise<boolean>;
  getPools(): SubgraphPoolBase[];
  /**
   * queryBatchSwap simulates a call to `batchSwap`, returning an array of Vault asset deltas.
   * @param batchSwap - BatchSwap information used for query.
   * @param {SwapType} batchSwap.kind - either exactIn or exactOut.
   * @param {BatchSwapStep[]} batchSwap.swaps - sequence of swaps.
   * @param {string[]} batchSwap.assets - array contains the addresses of all assets involved in the swaps.
   * @returns {Promise<string[]>} Returns an array with the net Vault asset balance deltas. Positive amounts represent tokens (or ETH) sent to the
   * Vault, and negative amounts represent tokens (or ETH) sent by the Vault. Each delta corresponds to the asset at
   * the same index in the `assets` array.
   */
  queryBatchSwap(
    batchSwap: Pick<BatchSwap, 'kind' | 'swaps' | 'assets'>
  ): Promise<string[]>;
  /**
   * Uses SOR to create and query a batchSwap.
   * @param {QueryWithSorInput} queryWithSor - Swap information used for querying using SOR.
   * @param {string[]} queryWithSor.tokensIn - Array of addresses of assets in.
   * @param {string[]} queryWithSor.tokensOut - Array of addresses of assets out.
   * @param {SwapType} queryWithSor.swapType - Type of Swap, ExactIn/Out.
   * @param {string[]} queryWithSor.amounts - Array of amounts used in swap.
   * @param {FetchPoolsInput} queryWithSor.fetchPools - Set whether SOR will fetch updated pool info.
   * @returns {Promise<QueryWithSorOutput>} Returns amount of tokens swaps along with swap and asset info that can be submitted to a batchSwap call.
   */
  queryBatchSwapWithSor(
    queryWithSor: QueryWithSorInput
  ): Promise<QueryWithSorOutput>;
  /**
   * Simple interface to test if a simple flash swap is valid and see potential profits.
   *
   * A "simple" flash swap is an arbitrage executed with only two tokens and two pools,
   * swapping in the first pool and then back in the second pool for a profit. For more
   * complex flash swaps, you will have to use the batch swap method.
   *
   * Learn more: A [Flash Swap](https://dev.balancer.fi/resources/swaps/flash-swaps).
   *
   * _NB: This method doesn't execute a flashSwap
   *
   * @param {SimpleFlashSwapParameters}   params - BatchSwap information used for query.
   * @param {string}                      params.flashLoanAmount - initial input amount for the flash loan (first asset)
   * @param {string[]}                    params.poolIds - array of Balancer pool ids
   * @param {string[]}                    params.assets - array of token addresses
   * @returns {Promise<{profits: Record<string, string>, isProfitable: boolean}>}       Returns an ethersjs transaction response
   */
  querySimpleFlashSwap(
    params: Omit<QuerySimpleFlashSwapParameters, 'vaultContract'>
  ): Promise<QuerySimpleFlashSwapResponse>;
  /**
   * Use SOR to get swapInfo for tokenIn<>tokenOut.
   * @param {SwapInput} swapInput - Swap information used for querying using SOR.
   * @param {string} swapInput.tokenIn - Addresse of asset in.
   * @param {string} swapInput.tokenOut - Addresse of asset out.
   * @param {SwapType} swapInput.swapType - Type of Swap, ExactIn/Out.
   * @param {string} swapInput.amount - Amount used in swap.
   * @returns {Promise<SwapInfo>} SOR swap info.
   */
  getSorSwap(swapInput: SwapInput): Promise<SwapInfo>;
}

type OutputReference = {
  index: number;
  key: BigNumber;
};
interface EncodeBatchSwapInput {
  swapType: SwapType;
  swaps: BatchSwapStep[];
  assets: string[];
  funds: FundManagement;
  limits: string[];
  deadline: BigNumberish;
  value: BigNumberish;
  outputReferences: OutputReference[];
}
interface EncodeExitPoolInput {
  poolId: string;
  poolKind: number;
  sender: string;
  recipient: string;
  outputReferences: OutputReference[];
  exitPoolRequest: ExitPoolRequest$1;
}
interface EncodeJoinPoolInput {
  poolId: string;
  kind: number;
  sender: string;
  recipient: string;
  joinPoolRequest: JoinPoolRequest$1;
  value: string;
  outputReference: string;
}
interface EncodeWrapAaveDynamicTokenInput {
  staticToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  fromUnderlying: boolean;
  outputReference: BigNumberish;
}
interface EncodeUnwrapAaveStaticTokenInput {
  staticToken: string;
  sender: string;
  recipient: string;
  amount: BigNumberish;
  toUnderlying: boolean;
  outputReferences: BigNumberish;
}
interface ExitAndBatchSwapInput {
  exiter: string;
  swapRecipient: string;
  poolId: string;
  exitTokens: string[];
  userData: string;
  expectedAmountsOut: string[];
  finalTokensOut: string[];
  slippage: string;
  fetchPools: FetchPoolsInput;
}
type ExitPoolData = ExitPoolRequest$1 & EncodeExitPoolInput;
type JoinPoolData = JoinPoolRequest$1 & EncodeJoinPoolInput;

declare class Relayer {
  private readonly swaps;
  static CHAINED_REFERENCE_TEMP_PREFIX: string;
  static CHAINED_REFERENCE_READONLY_PREFIX: string;
  constructor(swapsOrConfig: Swaps | BalancerSdkConfig);
  static encodeApproveVault(tokenAddress: string, maxAmount: string): string;
  static encodeSetRelayerApproval(
    relayerAdress: string,
    approved: boolean,
    authorisation: string
  ): string;
  static encodeGaugeWithdraw(
    gaugeAddress: string,
    sender: string,
    recipient: string,
    amount: string
  ): string;
  static encodeGaugeDeposit(
    gaugeAddress: string,
    sender: string,
    recipient: string,
    amount: string
  ): string;
  static encodeBatchSwap(params: EncodeBatchSwapInput): string;
  static encodeExitPool(params: EncodeExitPoolInput): string;
  static encodeJoinPool(params: EncodeJoinPoolInput): string;
  static encodeWrapAaveDynamicToken(
    params: EncodeWrapAaveDynamicTokenInput
  ): string;
  static encodeUnwrapAaveStaticToken(
    params: EncodeUnwrapAaveStaticTokenInput
  ): string;
  static encodePeekChainedReferenceValue(reference: BigNumberish): string;
  static toChainedReference(
    key: BigNumberish,
    isTemporary?: boolean
  ): BigNumber;
  static fromChainedReference(ref: string, isTemporary?: boolean): BigNumber;
  /**
   * Returns true if `amount` is not actually an amount, but rather a chained reference.
   */
  static isChainedReference(amount: string): boolean;
  static formatExitPoolInput(params: ExitPoolData): EncodeExitPoolInput;
  static formatJoinPoolInput(params: JoinPoolData): EncodeJoinPoolInput;
  /**
   * fetchPools saves updated pools data to SOR internal onChainBalanceCache.
   * @param {SubgraphPoolBase[]} [poolsData=[]] If poolsData passed uses this as pools source otherwise fetches from config.subgraphUrl.
   * @param {boolean} [isOnChain=true] If isOnChain is true will retrieve all required onChain data via multicall otherwise uses subgraph values.
   * @returns {boolean} Boolean indicating whether pools data was fetched correctly (true) or not (false).
   */
  fetchPools(): Promise<boolean>;
  getPools(): SubgraphPoolBase[];
  /**
   * exitPoolAndBatchSwap Chains poolExit with batchSwap to final tokens.
   * @param {ExitAndBatchSwapInput} params
   * @param {string} exiter - Address used to exit pool.
   * @param {string} swapRecipient - Address that receives final tokens.
   * @param {string} poolId - Id of pool being exited.
   * @param {string[]} exitTokens - Array containing addresses of tokens to receive after exiting pool. (must have the same length and order as the array returned by `getPoolTokens`.)
   * @param {string} userData - Encoded exitPool data.
   * @param {string[]} expectedAmountsOut - Expected amounts of exitTokens to receive when exiting pool.
   * @param {string[]} finalTokensOut - Array containing the addresses of the final tokens out.
   * @param {string} slippage - Slippage to be applied to swap section. i.e. 5%=50000000000000000.
   * @param {FetchPoolsInput} fetchPools - Set whether SOR will fetch updated pool info.
   * @returns Transaction data with calldata. Outputs.amountsOut has amounts of finalTokensOut returned.
   */
  exitPoolAndBatchSwap(params: ExitAndBatchSwapInput): Promise<TransactionData>;
  /**
   * swapUnwrapAaveStaticExactIn Finds swaps for tokenIn>wrapped Aave static tokens and chains with unwrap to underlying stable.
   * @param {string[]} tokensIn - array to token addresses for swapping as tokens in.
   * @param {string[]} aaveStaticTokens - array contains the addresses of the Aave static tokens that tokenIn will be swapped to. These will be unwrapped.
   * @param {string[]} amountsIn - amounts to be swapped for each token in.
   * @param {string[]} rates - The rate used to convert wrappedToken to underlying.
   * @param {FundManagement} funds - Funding info for swap. Note - recipient should be relayer and sender should be caller.
   * @param {string} slippage - Slippage to be applied to swap section. i.e. 5%=50000000000000000.
   * @param {FetchPoolsInput} fetchPools - Set whether SOR will fetch updated pool info.
   * @returns Transaction data with calldata. Outputs.amountsOut has final amounts out of unwrapped tokens.
   */
  swapUnwrapAaveStaticExactIn(
    tokensIn: string[],
    aaveStaticTokens: string[],
    amountsIn: string[],
    rates: string[],
    funds: FundManagement,
    slippage: string,
    fetchPools?: FetchPoolsInput
  ): Promise<TransactionData>;
  /**
   * swapUnwrapAaveStaticExactOut Finds swaps for tokenIn>wrapped Aave static tokens and chains with unwrap to underlying stable.
   * @param {string[]} tokensIn - array to token addresses for swapping as tokens in.
   * @param {string[]} aaveStaticTokens - array contains the addresses of the Aave static tokens that tokenIn will be swapped to. These will be unwrapped.
   * @param {string[]} amountsUnwrapped - amounts of unwrapped tokens out.
   * @param {string[]} rates - The rate used to convert wrappedToken to underlying.
   * @param {FundManagement} funds - Funding info for swap. Note - recipient should be relayer and sender should be caller.
   * @param {string} slippage - Slippage to be applied to swap section. i.e. 5%=50000000000000000.
   * @param {FetchPoolsInput} fetchPools - Set whether SOR will fetch updated pool info.
   * @returns Transaction data with calldata. Outputs.amountsIn has the amounts of tokensIn.
   */
  swapUnwrapAaveStaticExactOut(
    tokensIn: string[],
    aaveStaticTokens: string[],
    amountsUnwrapped: string[],
    rates: string[],
    funds: FundManagement,
    slippage: string,
    fetchPools?: FetchPoolsInput
  ): Promise<TransactionData>;
  /**
   * Creates encoded multicalls using swap outputs as input amounts for token unwrap.
   * @param wrappedTokens
   * @param swapType
   * @param swaps
   * @param assets
   * @param funds
   * @param limits
   * @returns
   */
  encodeSwapUnwrap(
    wrappedTokens: string[],
    swapType: SwapType,
    swaps: BatchSwapStep[],
    assets: string[],
    funds: FundManagement,
    limits: BigNumberish[]
  ): string[];
  static signRelayerApproval: (
    relayerAddress: string,
    signerAddress: string,
    signer: JsonRpcSigner,
    vault: Vault
  ) => Promise<string>;
}

declare class Subgraph {
  readonly url: string;
  readonly client: SubgraphClient;
  constructor(config: BalancerSdkConfig);
  private initClient;
}

declare class Sor extends SOR {
  constructor(sdkConfig: BalancerSdkConfig);
  private static getSorConfig;
  private static getSorNetworkConfig;
  private static getPoolDataService;
  private static getTokenPriceService;
}

declare class Pricing {
  private readonly swaps;
  constructor(config: BalancerSdkConfig, swaps?: Swaps);
  /**
   * Retrieves pools using poolDataService.
   * @returns {boolean} Boolean indicating whether pools data was fetched correctly (true) or not (false).
   */
  fetchPools(): Promise<boolean>;
  /**
   * Get currently saved pools list (fetched using fetchPools()).
   * @returns {SubgraphPoolBase[]} pools list.
   */
  getPools(): SubgraphPoolBase[];
  /**
   * Calculates Spot Price for a token pair - finds most liquid path and uses this as reference SP.
   * @param { string } tokenIn Token in address.
   * @param { string } tokenOut Token out address.
   * @param { SubgraphPoolBase[] } pools Optional - Pool data. Will be fetched via dataProvider if not supplied.
   * @returns  { string } Spot price.
   */
  getSpotPrice(
    tokenIn: string,
    tokenOut: string,
    pools?: SubgraphPoolBase[]
  ): Promise<string>;
}

type VeBalLockInfo = {
  lockedEndDate: number;
  lockedAmount: string;
  totalSupply: string;
  epoch: string;
  hasExistingLock: boolean;
  isExpired: boolean;
};
type VeBalLockInfoResult = {
  locked: BigNumber[];
  epoch: BigNumber;
  totalSupply: BigNumber;
};
declare class VeBal {
  addresses: ContractAddresses;
  provider: Provider;
  constructor(addresses: ContractAddresses, provider: Provider);
  getLockInfo(account: string): Promise<VeBalLockInfo | undefined>;
  formatLockInfo(lockInfo: VeBalLockInfoResult): VeBalLockInfo;
}

declare class VeBalProxy {
  instance: Contract;
  constructor(addresses: ContractAddresses, provider: Provider);
  getAdjustedBalance(account: string): Promise<string>;
}

type ContractFactory = (
  address: string,
  signerOrProvider: Signer | Provider
) => Contract;
interface ContractInstances {
  vault: Vault;
  balancerHelpers: BalancerHelpers;
  lidoRelayer?: LidoRelayer;
  multicall: Contract;
  relayerV3?: Contract;
  relayerV4?: Contract;
  veBal?: VeBal;
  veBalProxy?: VeBalProxy;
  ERC20: ContractFactory;
  liquidityGauge: ContractFactory;
  gaugeClaimHelper?: Contract;
}
declare class Contracts {
  contractAddresses: ContractAddresses;
  vault: Vault;
  balancerHelpers: BalancerHelpers;
  lidoRelayer?: LidoRelayer;
  multicall: Contract;
  relayerV3?: Contract;
  relayerV4?: Contract;
  veBal?: VeBal;
  veBalProxy?: VeBalProxy;
  gaugeClaimHelper?: Contract;
  /**
   * Create instances of Balancer contracts connected to passed provider.
   * @param { Network | ContractAddresses } networkOrAddresses
   * @param { Provider } provider
   */
  constructor(
    networkOrAddresses: Network | ContractAddresses,
    provider: Provider
  );
  /**
   * Expose contract instances.
   */
  get contracts(): ContractInstances;
  /**
   * Helper to create ERC20 contract.
   * @param { string } address ERC20 address.
   * @param { Signer | Provider } signerOrProvider Signer or Provider.
   * @returns Contract.
   */
  getErc20(address: string, signerOrProvider: Signer | Provider): Contract;
  /**
   * Helper to create LiquidityGauge contract.
   * @param { string } address Gauge address.
   * @param { Signer | Provider} signerOrProvider Signer or Provider.
   * @returns Contract.
   */
  getLiquidityGauge(
    address: string,
    signerOrProvider: Signer | Provider
  ): Contract;
}

declare class Migrations {
  private network;
  constructor(network: 1 | 5 | 137);
  /**
   * Builds migration call data.
   * Migrates tokens from staBal3 to bbausd2 pool.
   * Tokens that are initially staked are re-staked at the end of migration. Non-staked are not.
   *
   * @param userAddress User address.
   * @param staBal3Amount Amount of BPT tokens to migrate.
   * @param minBbausd2Out Minimum of expected BPT out ot the migration flow.
   * @param staked Indicates whether tokens are initially staked or not.
   * @param authorisation Encoded authorisation call.
   * @returns Migration transaction request ready to send with signer.sendTransaction
   */
  stabal3(
    userAddress: string,
    staBal3Amount: string,
    minBbausd2Out: string,
    staked: boolean,
    authorisation?: string
  ): {
    to: string;
    data: string;
    decode: (output: string, staked: boolean) => string;
  };
  /**
   * Builds migration call data.
   * Migrates tokens from bbausd1 to bbausd2 pool.
   * Tokens that are initially staked are re-staked at the end of migration. Non-staked are not.
   *
   * @param userAddress User address.
   * @param bbausd1Amount Amount of BPT tokens to migrate.
   * @param minBbausd2Out Minimum of expected BPT out ot the migration flow.
   * @param staked Indicates whether tokens are initially staked or not.
   * @param tokenBalances Token balances in EVM scale. Array must have the same length and order as tokens in pool being migrated from. Refer to [getPoolTokens](https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/interfaces/contracts/vault/IVault.sol#L334).
   * @param authorisation Encoded authorisation call.
   * @returns Migration transaction request ready to send with signer.sendTransaction
   */
  bbaUsd(
    userAddress: string,
    bbausd1Amount: string,
    minBbausd2Out: string,
    staked: boolean,
    tokenBalances: string[],
    authorisation?: string
  ): {
    to: string;
    data: string;
    decode: (output: string, staked: boolean) => string;
  };
  /**
   * Builds migration call data.
   * Migrates tokens from old stable to new stable phantom pools with the same underlying tokens.
   * Tokens that are initially staked are re-staked at the end of migration. Non-staked are not.
   *
   * @param userAddress User address.
   * @param from Pool info being migrated from
   * @param to Pool info being migrated to
   * @param bptIn Amount of BPT tokens to migrate.
   * @param minBptOut Minimum of expected BPT out ot the migration flow.
   * @param staked Indicates whether tokens are initially staked or not.
   * @param underlyingTokens Underlying token addresses. Array must have the same length and order as tokens in pool being migrated from. Refer to [getPoolTokens](https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/interfaces/contracts/vault/IVault.sol#L334).
   * @param authorisation Encoded authorisation call.
   * @returns Migration transaction request ready to send with signer.sendTransaction
   */
  stables(
    userAddress: string,
    from: {
      id: string;
      address: string;
      gauge?: string;
    },
    to: {
      id: string;
      address: string;
      gauge?: string;
    },
    bptIn: string,
    minBptOut: string,
    staked: boolean,
    underlyingTokens: string[],
    authorisation?: string
  ): {
    to: string;
    data: string;
    decode: (output: string, staked: boolean) => string;
  };
  /**
   * Builds migration call data.
   * Migrates tokens from staBal3 to bbausd2 pool.
   * Tokens that are initially staked are re-staked at the end of migration. Non-staked are not.
   *
   * @param userAddress User address.
   * @param bptIn Amount of BPT tokens to migrate.
   * @param minBptOut Minimum of expected BPT out ot the migration flow.
   * @param staked Indicates whether tokens are initially staked or not.
   * @param authorisation Encoded authorisation call.
   * @returns Migration transaction request ready to send with signer.sendTransaction
   */
  maiusd(
    userAddress: string,
    bptIn: string,
    minBptOut: string,
    staked: boolean,
    authorisation?: string
  ): {
    to: string;
    data: string;
    decode: (output: string, staked: boolean) => string;
  };
}

declare class Zaps {
  network: Network;
  migrations: Migrations;
  constructor(network: Network);
}

type Asset = {
  priceDelta: number;
  weight: number;
};
type TokenPrices = {
  [key: string]: number;
};
declare class ImpermanentLossService {
  private tokenPrices;
  private tokenHistoricalPrices;
  constructor(
    tokenPrices: Findable<Price>,
    tokenHistoricalPrices: Findable<Price>
  );
  /**
   * entry point to calculate impermanent loss.
   *
   * The function will
   *  - retrieve the tokens' historical value at the desired time in the future
   *  - calculate the relative variation between current and historical value
   *  - return the IL in percentage rounded to 2 decimal places
   *
   * @param timestamp UNIX timestamp from which the IL is desired
   * @param pool the pool
   * @returns the impermanent loss as percentage rounded to 2 decimal places
   */
  calcImpLoss(timestamp: number, pool: Pool$1): Promise<number>;
  calculateImpermanentLoss(
    poolValueDelta: number,
    holdValueDelta: number
  ): number;
  getPoolValueDelta(assets: Asset[]): number;
  getHoldValueDelta(assets: Asset[]): number;
  /**
   * prepare the data for calculating the impermanent loss
   *
   * @param entryTimestamp UNIX timestamp from which the IL is desired
   * @param pool the pool
   * @returns a list of pair weight/price delta for each token in the pool
   * @throws BalancerError if
   *  1. a token's price is unknown
   *  2. a token's weight is unknown
   *  3. the user has no liquidity invested in the pool
   */
  prepareData(entryTimestamp: number, pool: Pool$1): Promise<Asset[]>;
  getAssets(
    poolTokens: PoolToken[],
    exitPrices: TokenPrices,
    entryPrices: TokenPrices,
    weights: number[]
  ): Asset[];
  getDelta(entryPrice: number, exitPrice: number): number;
  /**
   * returns the list of token's weights.
   *
   * @param poolTokens the pools' tokens
   * @returns the list of token's weights
   * @throws BalancerError if a token's weight is missing
   *
   */
  getWeights(poolTokens: PoolToken[]): number[];
  /**
   * get the current's tokens' prices
   * @param tokens the pools' tokens
   * @returns a list of tokens with prices
   */
  getExitPrices(tokens: PoolToken[]): Promise<TokenPrices>;
  /**
   * get the tokens' price at a given time
   *
   * @param timestamp the Unix timestamp
   * @param tokenAddresses the tokens' addresses
   * @returns a map of tokens' price
   */
  getEntryPrices(
    timestamp: number,
    tokenAddresses: string[]
  ): Promise<TokenPrices>;
}

type SpotPrices = {
  [tokenIn: string]: string;
};
interface Node {
  address: string;
  id: string;
  joinAction: JoinAction;
  exitAction: ExitAction;
  type: string;
  children: Node[];
  marked: boolean;
  index: string;
  proportionOfParent: BigNumber;
  parent: Node | undefined;
  isLeaf: boolean;
  spotPrices: SpotPrices;
  decimals: number;
}
type JoinAction =
  | 'input'
  | 'batchSwap'
  | 'wrap'
  | 'joinPool'
  | 'wrapAaveDynamicToken'
  | 'wrapERC4626';
type ExitAction =
  | 'output'
  | 'batchSwap'
  | 'unwrap'
  | 'exitPool'
  | 'unwrapAaveStaticToken'
  | 'unwrapERC4626';
declare class PoolGraph {
  private pools;
  constructor(pools: Findable<Pool$1, PoolAttribute>);
  buildGraphFromRootPool(
    poolId: string,
    wrapMainTokens: boolean
  ): Promise<Node>;
  getTokenTotal(pool: Pool$1): BigNumber;
  buildGraphFromPool(
    address: string,
    nodeIndex: number,
    parent: Node | undefined,
    proportionOfParent: BigNumber,
    wrapMainTokens: boolean
  ): Promise<[Node, number]>;
  createLinearNodeChildren(
    linearPoolNode: Node,
    nodeIndex: number,
    linearPool: Pool$1,
    wrapMainTokens: boolean
  ): [Node, number];
  createWrappedTokenNode(
    linearPool: Pool$1,
    nodeIndex: number,
    parent: Node | undefined,
    proportionOfParent: BigNumber
  ): [Node, number];
  static createInputTokenNode(
    nodeIndex: number,
    address: string,
    decimals: number,
    parent: Node | undefined,
    proportionOfParent: BigNumber
  ): [Node, number];
  static orderByBfs(root: Node): Node[];
  static getLeafAddresses(nodes: Node[]): string[];
  getGraphNodes: (
    isJoin: boolean,
    poolId: string,
    wrapMainTokens: boolean
  ) => Promise<Node[]>;
}

interface PoolDictionary {
  [poolId: string]: Pool;
}
type Pool = (
  | WeightedPool
  | StablePool
  | LinearPool
  | MetaStablePool
  | PhantomStablePool
  | ComposableStablePool
) & {
  SubgraphType: string;
};
declare class PoolsSource {
  private poolDataService;
  private wrappedNativeAsset;
  poolsArray: SubgraphPoolBase[];
  poolsDict: PoolDictionary;
  constructor(poolDataService: PoolDataService, wrappedNativeAsset: string);
  dataSource(): PoolDataService;
  all(refresh?: boolean): Promise<SubgraphPoolBase[]>;
  parseToPoolsDict(pools: SubgraphPoolBase[]): PoolDictionary;
  parseNewPool(subgraphPool: SubgraphPoolBase): Pool | undefined;
  /**
   * Converts Subgraph array into PoolDictionary
   * @param refresh
   * @returns
   */
  poolsDictionary(refresh?: boolean): Promise<PoolDictionary>;
}

interface JoinPoolRequest {
  actionType: ActionType.Join;
  poolId: string;
  encodedUserData: string;
  outputReference: string;
}

interface ExitPoolRequest {
  actionType: ActionType.Exit;
  poolId: string;
  encodedUserData: string;
  outputReferences: OutputReference[];
}

interface BatchSwapRequest
  extends Pick<
    EncodeBatchSwapInput,
    'swaps' | 'assets' | 'funds' | 'swapType' | 'outputReferences'
  > {
  actionType: ActionType.BatchSwap;
}

declare enum ActionType {
  BatchSwap = 0,
  Join = 1,
  Exit = 2,
}
type Requests = BatchSwapRequest | JoinPoolRequest | ExitPoolRequest;
/**
 * Controller / use-case layer for interacting with pools data.
 */
declare class VaultModel {
  poolsSource: PoolsSource;
  constructor(poolDataService: PoolDataService, wrappedNativeAsset: string);
  updateDeltas(
    deltas: Record<string, BigNumber>,
    assets: string[],
    amounts: string[]
  ): Record<string, BigNumber>;
  multicall(
    rawCalls: Requests[],
    refresh?: boolean
  ): Promise<Record<string, BigNumber>>;
  static mapBatchSwapRequest(call: EncodeBatchSwapInput): BatchSwapRequest;
  static mapJoinPoolRequest(call: EncodeJoinPoolInput): JoinPoolRequest;
  static mapExitPoolRequest(call: EncodeExitPoolInput): ExitPoolRequest;
}

declare enum SimulationType {
  Tenderly = 0,
  VaultModel = 1,
  Static = 2,
}
/**
 * Simulation module is responsible for simulating the results of a generalised
 * join or exit using different types of simulation, such as:
 * - Tenderly: uses Tenderly Simulation API (third party service)
 * - VaultModel: uses TS math, which may be less accurate (min. 99% accuracy)
 * - Static: uses staticCall, which is 100% accurate but requires vault approval
 *
 * This module allows a user to perform a simulation and check for expected
 * amounts out in order to make an informed decision on whether to proceed with
 * the transaction. These expected amounts out can be used as limits to prevent
 * frontrunning and ensure that the transaction will return minimum amounts out.
 */
declare class Simulation {
  private tenderlyHelper;
  private vaultModel;
  constructor(
    networkConfig: BalancerNetworkConfig,
    poolDataService?: PoolDataService
  );
  simulateGeneralisedJoin: (
    to: string,
    multiRequests: Requests[][],
    encodedCall: string,
    outputIndexes: number[],
    userAddress: string,
    tokensIn: string[],
    signer: JsonRpcSigner,
    simulationType: SimulationType
  ) => Promise<string[]>;
  simulateGeneralisedExit: (
    to: string,
    multiRequests: Requests[][],
    encodedCall: string,
    outputIndexes: number[],
    userAddress: string,
    tokenIn: string,
    signer: JsonRpcSigner,
    simulationType: SimulationType
  ) => Promise<string[]>;
  private decodeResult;
  private simulateRequests;
}

declare class Join {
  private poolGraph;
  private simulationService;
  private relayer;
  private wrappedNativeAsset;
  constructor(
    poolGraph: PoolGraph,
    networkConfig: BalancerNetworkConfig,
    simulationService: Simulation
  );
  joinPool(
    poolId: string,
    tokensIn: string[],
    amountsIn: string[],
    userAddress: string,
    wrapMainTokens: boolean,
    slippage: string,
    signer: JsonRpcSigner,
    simulationType: SimulationType,
    authorisation?: string
  ): Promise<{
    to: string;
    encodedCall: string;
    expectedOut: string;
    minOut: string;
    priceImpact: string;
  }>;
  private assertDeltas;
  static getJoinPaths: (
    orderedNodes: Node[],
    tokensIn: string[],
    amountsIn: string[]
  ) => Node[][];
  private static updateInputAmounts;
  private createCalls;
  static totalBptZeroPriceImpact: (joinPaths: Node[][]) => BigNumber;
  static bptOutZeroPiForInputNode: (inputNode: Node) => bigint;
  private amountsOutByJoinPath;
  private minAmountsOutByJoinPath;
  private updateDeltas;
  private createActionCalls;
  /**
   * Creates a map of node address and total proportion. Used for the case where there may be multiple inputs using same token, e.g. DAI input to 2 pools.
   * @param nodes nodes to consider.
   */
  static updateTotalProportions: (nodes: Node[]) => Record<string, BigNumber>;
  /**
   * Uses relayer to approve itself to act in behalf of the user
   *
   * @param authorisation Encoded authorisation call.
   * @returns relayer approval call
   */
  private createSetRelayerApproval;
  static updateNodeAmount: (
    node: Node,
    tokensIn: string[],
    amountsIn: string[],
    totalProportions: Record<string, BigNumber>
  ) => Node;
  private createAaveWrap;
  private createBatchSwap;
  private createJoinPool;
  private getOutputRefValue;
}

declare class Exit {
  private poolGraph;
  private simulationService;
  private wrappedNativeAsset;
  private relayer;
  constructor(
    poolGraph: PoolGraph,
    networkConfig: BalancerNetworkConfig,
    simulationService: Simulation
  );
  exitPool(
    poolId: string,
    amountBptIn: string,
    userAddress: string,
    slippage: string,
    signer: JsonRpcSigner,
    simulationType: SimulationType,
    authorisation?: string
  ): Promise<{
    to: string;
    encodedCall: string;
    tokensOut: string[];
    expectedAmountsOut: string[];
    minAmountsOut: string[];
    priceImpact: string;
  }>;
  private calculatePriceImpact;
  private assertDeltas;
  private amountsOutByExitPath;
  private amountsOutByTokenOut;
  private minAmountsOut;
  private getExitPaths;
  private createCalls;
  private updateDeltas;
  private createActionCalls;
  private createBatchSwap;
  private createExitPool;
  private getOutputRef;
}

declare class PoolVolume {
  private yesterdaysPools;
  constructor(yesterdaysPools: Findable<Pool$1, PoolAttribute> | undefined);
  last24h(pool: Pool$1): Promise<number>;
}

declare class PoolFees {
  private yesterdaysPools;
  constructor(yesterdaysPools: Findable<Pool$1, PoolAttribute> | undefined);
  last24h(pool: Pool$1): Promise<number>;
}

type Address = string;
type CreatePoolParameters = {
  factoryAddress: string;
  name: string;
  symbol: string;
  tokenAddresses: string[];
  swapFee: string | number;
  owner: Address;
};
interface ComposableStableCreatePoolParameters extends CreatePoolParameters {
  amplificationParameter: number | string;
  rateProviders: string[];
  tokenRateCacheDurations: number[] | string[];
  exemptFromYieldProtocolFeeFlags: boolean[];
}
interface WeightedCreatePoolParameters extends CreatePoolParameters {
  weights: BigNumberish[];
}
interface InitJoinPoolParameters {
  joiner: string;
  poolId: string;
  poolAddress: string;
  tokensIn: string[];
  amountsIn: string[];
}
interface InitJoinPoolAttributes {
  to: string;
  functionName: string;
  attributes: JoinPool;
  data: string;
  value?: BigNumber;
}

interface PoolFactory {
  create(
    parameters:
      | ComposableStableCreatePoolParameters
      | WeightedCreatePoolParameters
  ): TransactionRequest;
  buildInitJoin: (parameters: InitJoinPoolParameters) => InitJoinPoolAttributes;
}

/**
 * Wrapper around pool type specific methods.
 *
 * Returns a class instance of a type specific factory.
 */
declare class PoolFactory__factory {
  networkConfig: BalancerNetworkConfig;
  constructor(networkConfig: BalancerNetworkConfig);
  of(poolType: PoolType): PoolFactory;
}

/**
 * Returns BAL emissions per pool
 */
declare class EmissionsService {
  private liquidityGaugesRepository;
  constructor(liquidityGaugesRepository: Findable<LiquidityGauge>);
  relativeWeight(poolId: string): Promise<number>;
  weekly(poolId: string): Promise<number>;
}

/**
 * Controller / use-case layer for interacting with pools data.
 */
declare class Pools implements Findable<PoolWithMethods> {
  private networkConfig;
  private repositories;
  aprService: PoolApr;
  liquidityService: Liquidity;
  joinService: Join;
  exitService: Exit;
  feesService: PoolFees;
  volumeService: PoolVolume;
  simulationService: Simulation;
  poolFactory: PoolFactory__factory;
  impermanentLossService: ImpermanentLossService;
  graphService: PoolGraph;
  emissionsService: EmissionsService | undefined;
  proportionalAmounts: (
    pool: {
      id: string;
      tokens: {
        address: string;
        balance: string;
        decimals?: number | undefined;
      }[];
    },
    token: string,
    amount: string
  ) => {
    tokens: string[];
    amounts: string[];
  };
  constructor(
    networkConfig: BalancerNetworkConfig,
    repositories: BalancerDataRepositories
  );
  dataSource(): Findable<Pool$1, PoolAttribute> & Searchable<Pool$1>;
  /**
   * Calculates APR on any pool data
   *
   * @param pool
   * @returns
   */
  apr(pool: Pool$1): Promise<AprBreakdown>;
  /**
   * Calculates Impermanent Loss on any pool data
   *
   * @param timestamp
   * @param pool
   * @returns
   */
  impermanentLoss(timestamp: number, pool: Pool$1): Promise<number>;
  /**
   * Calculates total liquidity of the pool
   *
   * @param pool
   * @returns
   */
  liquidity(pool: Pool$1): Promise<string>;
  /**
   * Builds generalised join transaction
   *
   * @param poolId          Pool id
   * @param tokens          Token addresses
   * @param amounts         Token amounts in EVM scale
   * @param userAddress     User address
   * @param wrapMainTokens  Indicates whether main tokens should be wrapped before being used
   * @param slippage        Maximum slippage tolerance in bps i.e. 50 = 0.5%.
   * @param signer          JsonRpcSigner that will sign the staticCall transaction if Static simulation chosen
   * @param simulationType  Simulation type (VaultModel, Tenderly or Static)
   * @param authorisation   Optional auhtorisation call to be added to the chained transaction
   * @returns transaction data ready to be sent to the network along with min and expected BPT amounts out.
   */
  generalisedJoin(
    poolId: string,
    tokens: string[],
    amounts: string[],
    userAddress: string,
    wrapMainTokens: boolean,
    slippage: string,
    signer: JsonRpcSigner,
    simulationType: SimulationType,
    authorisation?: string
  ): Promise<{
    to: string;
    encodedCall: string;
    minOut: string;
    expectedOut: string;
    priceImpact: string;
  }>;
  /**
   * Builds generalised exit transaction
   *
   * @param poolId          Pool id
   * @param amount          Token amount in EVM scale
   * @param userAddress     User address
   * @param slippage        Maximum slippage tolerance in bps i.e. 50 = 0.5%.
   * @param signer          JsonRpcSigner that will sign the staticCall transaction if Static simulation chosen
   * @param simulationType  Simulation type (VaultModel, Tenderly or Static)
   * @param authorisation   Optional auhtorisation call to be added to the chained transaction
   * @returns transaction data ready to be sent to the network along with tokens, min and expected amounts out.
   */
  generalisedExit(
    poolId: string,
    amount: string,
    userAddress: string,
    slippage: string,
    signer: JsonRpcSigner,
    simulationType: SimulationType,
    authorisation?: string
  ): Promise<{
    to: string;
    encodedCall: string;
    tokensOut: string[];
    expectedAmountsOut: string[];
    minAmountsOut: string[];
    priceImpact: string;
  }>;
  /**
   * Calculates total fees for the pool in the last 24 hours
   *
   * @param pool
   * @returns
   */
  fees(pool: Pool$1): Promise<number>;
  /**
   * Calculates total volume of the pool in the last 24 hours
   *
   * @param pool
   * @returns
   */
  volume(pool: Pool$1): Promise<number>;
  static wrap(
    pool: Pool$1,
    networkConfig: BalancerNetworkConfig
  ): PoolWithMethods;
  find(id: string): Promise<PoolWithMethods | undefined>;
  findBy(param: string, value: string): Promise<PoolWithMethods | undefined>;
  all(): Promise<PoolWithMethods[]>;
  where(filter: (pool: Pool$1) => boolean): Promise<PoolWithMethods[]>;
}

interface BalancerSDKRoot {
  config: BalancerSdkConfig;
  sor: Sor;
  subgraph: Subgraph;
  pools: Pools;
  data: Data;
  swaps: Swaps;
  relayer: Relayer;
  networkConfig: BalancerNetworkConfig;
  rpcProvider: Provider;
  claimService?: IClaimService;
}
declare class BalancerSDK implements BalancerSDKRoot {
  config: BalancerSdkConfig;
  sor: Sor;
  subgraph: Subgraph;
  readonly swaps: Swaps;
  readonly relayer: Relayer;
  readonly pricing: Pricing;
  readonly pools: Pools;
  readonly data: Data;
  balancerContracts: Contracts;
  zaps: Zaps;
  vaultModel: VaultModel;
  readonly networkConfig: BalancerNetworkConfig;
  readonly provider: Provider;
  readonly claimService?: IClaimService;
  constructor(config: BalancerSdkConfig, sor?: Sor, subgraph?: Subgraph);
  get rpcProvider(): Provider;
  /**
   * Expose balancer contracts, e.g. Vault, LidoRelayer.
   */
  get contracts(): ContractInstances;
}

declare function canUseJoinExit(
  swapType: SwapTypes,
  tokenIn: string,
  tokenOut: string
): boolean;
/**
 * Find if any of the swaps are join/exits. If yes these swaps should be routed via Relayer.
 * @param pools
 * @param swaps
 * @param assets
 * @returns
 */
declare function someJoinExit(
  pools: SubgraphPoolBase[],
  swaps: SwapV2[],
  assets: string[]
): boolean;
/**
 * Given swapInfo from the SOR construct the Relayer multicall to execture swaps/joins/exits.
 * @param swapInfo Returned from SOR
 * @param swapType Only supports ExactIn
 * @param pools Pool info from SOR
 * @param user Address of user
 * @param relayerAddress Address of Relayer (>=V4)
 * @param wrappedNativeAsset Address of Native asset
 * @param slippage [bps], eg: 1 === 0.01%, 100 === 1%
 * @param authorisation Encoded authorisation call.
 * @returns
 */
declare function buildRelayerCalls(
  swapInfo: SwapInfo,
  pools: SubgraphPoolBase[],
  user: string,
  relayerAddress: string,
  wrappedNativeAsset: string,
  slippage: string,
  authorisation: string | undefined
): {
  to: string;
  data: string;
  rawCalls: string[];
  inputs: (EncodeBatchSwapInput | ExitPoolData | EncodeJoinPoolInput)[];
};

declare enum BalancerErrorCode {
  SWAP_ZERO_RETURN_AMOUNT = 'SWAP_ZERO_RETURN_AMOUNT',
  UNWRAP_ZERO_AMOUNT = 'UNWRAP_ZERO_AMOUNT',
  WRAP_ZERO_AMOUNT = 'WRAP_ZERO_AMOUNT',
  QUERY_BATCH_SWAP = 'QUERY_BATCH_SWAP',
  POOL_DOESNT_EXIST = 'POOL_DOESNT_EXIST',
  UNSUPPORTED_POOL_TYPE = 'UNSUPPORTED_POOL_TYPE',
  UNSUPPORTED_POOL_TYPE_VERSION = 'UNSUPPORTED_POOL_TYPE_VERSION',
  UNSUPPORTED_PAIR = 'UNSUPPORTED_PAIR',
  NO_POOL_DATA = 'NO_POOL_DATA',
  INPUT_OUT_OF_BOUNDS = 'INPUT_OUT_OF_BOUNDS',
  INPUT_LENGTH_MISMATCH = 'INPUT_LENGTH_MISMATCH',
  INPUT_TOKEN_INVALID = 'INPUT_TOKEN_INVALID',
  INPUT_ZERO_NOT_ALLOWED = 'INPUT_ZERO_NOT_ALLOWED',
  INTERNAL_ERROR_INVALID_ABI = 'INTERNAL_ERROR_INVALID_ABI',
  TOKEN_MISMATCH = 'TOKEN_MISMATCH',
  MISSING_TOKENS = 'MISSING_TOKENS',
  MISSING_AMP = 'MISSING_AMP',
  MISSING_DECIMALS = 'MISSING_DECIMALS',
  MISSING_PRICE_RATE = 'MISSING_PRICE_RATE',
  MISSING_WEIGHT = 'MISSING_WEIGHT',
  RELAY_SWAP_AMOUNTS = 'RELAY_SWAP_AMOUNTS',
  NO_VALUE_PARAMETER = 'NO_VALUE_PARAMETER',
  ILLEGAL_PARAMETER = 'ILLEGAL_PARAMETER',
  TIMESTAMP_IN_THE_FUTURE = 'TIMESTAMP_IN_THE_FUTURE',
  JOIN_DELTA_AMOUNTS = 'JOIN_DELTA_AMOUNTS',
  EXIT_DELTA_AMOUNTS = 'EXIT_DELTA_AMOUNTS',
  GAUGES_NOT_FOUND = 'GAUGES_NOT_FOUND',
  GAUGES_HELPER_ADDRESS_NOT_PROVIDED = 'GAUGES_HELPER_ADDRESS_NOT_PROVIDED',
  GAUGES_REWARD_MINTER_ADDRESS_NOT_PROVIDED = 'GAUGES_REWARD_MINTER_ADDRESS_NOT_PROVIDED',
  GAUGES_REWARD_TOKEN_EMPTY = 'GAUGES_REWARD_TOKEN_EMPTY',
  REWARD_TOKEN_ZERO = 'REWARD_TOKEN_ZERO',
  FEE_PROVIDER_NOT_PROVIDED = 'FEE_PROVIDER_NOT_PROVIDED',
}
declare class BalancerError extends Error {
  code: BalancerErrorCode;
  constructor(code: BalancerErrorCode);
  static getMessage(code: BalancerErrorCode): string;
}

export {
  APR_THRESHOLD,
  AaveHelpers,
  Account,
  Address$1 as Address,
  AprBreakdown,
  AprFetcher,
  AssetHelpers,
  BalancerAPIArgsFormatter,
  BalancerDataRepositories,
  BalancerError,
  BalancerErrorCode,
  BalancerErrors,
  BalancerMinterAuthorization,
  BalancerNetworkConfig,
  BalancerSDK,
  BalancerSDKRoot,
  BalancerSdkConfig,
  BalancerSdkSorConfig,
  BalancerTenderlyConfig,
  BaseFeeDistributor,
  BatchSwap,
  BatchSwapStep,
  BlockNumberRepository,
  BuildTransactionParameters,
  ComposableStablePoolEncoder,
  ComposableStablePoolExitKind,
  ComposableStablePoolJoinKind,
  ContractAddresses,
  Currency,
  Data,
  Debouncer,
  EncodeBatchSwapInput,
  EncodeExitPoolInput,
  EncodeJoinPoolInput,
  EncodeUnwrapAaveStaticTokenInput,
  EncodeWrapAaveDynamicTokenInput,
  ExitAndBatchSwapInput,
  ExitPoolData,
  ExitPoolRequest$1 as ExitPoolRequest,
  FeeCollectorRepository,
  FeeDistributorData,
  FeeDistributorRepository,
  FetchPoolsInput,
  FindRouteParameters,
  Findable,
  FundManagement,
  GaugeControllerMulticallRepository,
  GaugeShare,
  GaugeShareAttributes,
  GaugeSharesRepository,
  GraphQLArgs,
  GraphQLArgsBuilder,
  GraphQLArgsFormatter,
  GraphQLFilter,
  GraphQLFilterOperator,
  GraphQLQuery,
  HistoricalPrices,
  JoinPoolData,
  JoinPoolRequest$1 as JoinPoolRequest,
  Liquidity,
  LiquidityGauge,
  LiquidityGaugeSubgraphRPCProvider,
  LiquidityGaugesMulticallRepository,
  LiquidityGaugesSubgraphRepository,
  ManagedPoolEncoder,
  NamedPools,
  Network,
  OnchainPoolData,
  OnchainTokenData,
  OutputReference,
  POOLS,
  Pool$1 as Pool,
  PoolAttribute,
  PoolBPTValue,
  PoolBalanceOp,
  PoolBalanceOpKind,
  PoolGauges,
  PoolGaugesAttributes,
  PoolGaugesRepository,
  PoolJoinExit,
  PoolJoinExitAttributes,
  PoolJoinExitRepository,
  PoolReference,
  PoolRepository,
  PoolShare,
  PoolShareAttributes,
  PoolSharesRepository,
  PoolSpecialization,
  PoolToken,
  PoolType,
  PoolWithMethods,
  Pools,
  PoolsBalancerAPIRepository,
  PoolsFallbackRepository,
  PoolsFallbackRepositoryOptions,
  PoolsRepositoryFetchOptions,
  PoolsStaticRepository,
  PoolsSubgraphOnChainRepository,
  PoolsSubgraphRepository,
  Price,
  PriceRateProvider,
  ProtocolFees,
  ProtocolFeesProvider,
  QuerySimpleFlashSwapParameters,
  QuerySimpleFlashSwapResponse,
  QueryWithSorInput,
  QueryWithSorOutput,
  Relayer,
  RelayerAction,
  RelayerAuthorization,
  RewardData,
  SHALLOW_COMPOSABLE_STABLE_BUFFER,
  Searchable,
  SimpleFlashSwapParameters,
  SimulationType,
  SingleSwap,
  StablePhantomPoolJoinKind,
  StablePoolEncoder,
  StablePoolExitKind,
  StablePoolJoinKind,
  StaticTokenProvider,
  SubPool,
  SubPoolMeta,
  Subgraph,
  SubgraphArgsFormatter,
  Swap,
  SwapAttributes,
  SwapInput,
  SwapTransactionRequest,
  SwapType,
  Swaps,
  Token,
  TokenAttribute,
  TokenPrices$1 as TokenPrices,
  TokenProvider,
  TokenYieldsRepository,
  TransactionData,
  UserBalanceOp,
  UserBalanceOpKind,
  WeightedPoolEncoder,
  WeightedPoolExitKind,
  WeightedPoolJoinKind,
  accountToAddress,
  addressMapIn,
  emissions as balEmissions,
  bn,
  buildRelayerCalls,
  canUseJoinExit,
  formatFixed,
  formatFromBigInt18,
  getEthValue,
  getLimitsForSlippage,
  getPoolAddress,
  getPoolNonce,
  getPoolSpecialization,
  insert,
  isLinearish,
  isNormalizedWeights,
  isSameAddress,
  parseFixed,
  parsePoolInfo,
  parseToBigInt18,
  removeItem,
  reorderArrays,
  replace,
  signPermit,
  someJoinExit,
  splitPoolId,
  toNormalizedWeights,
  tokenAddressForPricing,
  tokensToTokenPrices,
  unwrapToken,
};
