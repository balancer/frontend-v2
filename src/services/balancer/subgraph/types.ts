import { DecoratedFarm } from '@/beethovenx/services/subgraph/subgraph-types';

import { BigNumber } from 'ethers';
import {
  GqlBalancePoolApr,
  GqlBeetsFarm
} from '@/beethovenx/services/beethovenx/beethovenx-types';

export type Address = string;
export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs
) => Record<string, any>;

export enum PoolType {
  Weighted = 'Weighted',
  Investment = 'Investment',
  Stable = 'Stable',
  MetaStable = 'MetaStable',
  StablePhantom = 'StablePhantom',
  LiquidityBootstrapping = 'LiquidityBootstrapping',
  Linear = 'Linear'
}
export type TimeTravelPeriod = '24h';

export interface PoolToken {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  balance: string;
  weight: string;
  priceRate: string | null;
  isBpt?: boolean;
  isPhantomBpt?: boolean;
}

export interface RawPoolTokens {
  balances: BigNumber[];
  lastChangeBlock: BigNumber;
  tokens: string[];
}

export interface Pool {
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
  tokenAddresses: string[];
  totalLiquidity: string;
  totalShares: string;
  totalSwapFee: string;
  totalSwapVolume: string;
  onchain?: OnchainPoolData;
  createTime: number;
  swapEnabled: boolean;
  mainTokens?: string[];
  wrappedTokens?: string[];
  linearPoolTokensMap?: Record<string, PoolToken>;
  linearPoolToMainTokenMap?: Record<string, string>;
  unwrappedTokens?: string[];
  tokenRates?: string[];
  stablePhantomPools?: {
    id: string;
    address: string;
    symbol: string;
    tokens: PoolToken[];
    totalSupply: string;
    balance: string;
  }[];
  linearPools?: {
    id: string;
    symbol: string;
    address: string;
    priceRate: string;
    unwrappedTokenAddress: string;
    totalSupply: string;
    balance: string;
    mainTokenTotalBalance: string;
    mainToken: {
      address: string;
      index: number;
      balance: string;
      name: string;
      symbol: string;
      decimals: number;
    };
    wrappedToken: {
      address: string;
      index: number;
      balance: string;
      priceRate: string;
      name: string;
      symbol: string;
      decimals: number;
    };
    poolToken: string;
  }[];
  apr: GqlBalancePoolApr;
  farm?: GqlBeetsFarm;
  isNewPool?: boolean;
  volume24h: string;
  fees24h: string;
}

export interface LinearPool extends Pool {
  mainIndex: number;
  wrappedIndex: number;
  swapEnabled: boolean;
  lowerTarget: string;
  upperTarget: string;
}

export type DecoratedPool = Pool;

export interface PoolApr {
  pool: string;
  thirdParty: string;
  liquidityMining: string;
  liquidityMiningBreakdown: { [address: string]: string };
  total: string;
  thirdPartyBreakdown: { [address: string]: string };
}

export interface OnchainTokenData {
  balance: string;
  weight: string;
  decimals: number;
  //logoURI: string;
  name: string;
  symbol: string;
}

export type OnchainTokenDataMap = Record<Address, OnchainTokenData>;

export interface RawOnchainPoolData {
  decimals: number;
  poolTokens: RawPoolTokens;
  swapFee: BigNumber;
  totalSupply: BigNumber;
  weights?: BigNumber[];
  swapEnabled?: boolean;
  amp?: {
    value: BigNumber;
    precision: BigNumber;
  };
  linearPools?: Record<Address, RawLinearPoolData>;
  tokenRates?: BigNumber[];
}

export interface OnchainPoolData {
  tokens: Record<Address, OnchainTokenData>;
  totalSupply: string;
  decimals: number;
  swapFee: string;
  amp?: string;
  swapEnabled: boolean;
  linearPools?: Record<Address, LinearPoolData>;
  tokenRates?: string[];
}

export interface RawLinearPoolToken {
  address: string;
  index: BigNumber;
}

export interface RawWrappedLinearPoolToken extends RawLinearPoolToken {
  rate: string;
}

export interface LinearPoolToken {
  address: string;
  index: number;
  balance: string;
}

export interface WrappedLinearPoolToken extends LinearPoolToken {
  priceRate: string;
}

export interface RawLinearPoolData {
  id: string;
  priceRate: BigNumber;
  mainToken: RawLinearPoolToken;
  wrappedToken: RawWrappedLinearPoolToken;
  unwrappedTokenAddress: string;
  totalSupply: string;
  tokenData: RawPoolTokens;
}
export type RawLinearPoolDataMap = Record<Address, RawLinearPoolData>;

export interface LinearPoolData {
  id: string;
  priceRate: string;
  mainToken: LinearPoolToken;
  wrappedToken: WrappedLinearPoolToken;
  unwrappedTokenAddress: string;
  totalSupply: string;
  balance: string;
  poolToken: string;
}
export type LinearPoolDataMap = Record<Address, LinearPoolData>;

export interface FullPool extends DecoratedPool {
  onchain: OnchainPoolData;
  //farm?: DecoratedFarm;
  shares?: string;
}

export interface FullPoolWithFarm extends FullPool {
  decoratedFarm?: DecoratedFarm;
}

export type AnyPool = Pool | FullPool | DecoratedPoolWithShares;

export interface PoolShare {
  poolId: {
    id: string;
  };
  balance: string;
}

export interface DecoratedPoolWithShares extends DecoratedPool {
  shares: string;
  decoratedFarm?: DecoratedFarm;
  userBalance?: string;
  hasUnstakedBpt?: boolean;
}

export type PoolActivityType = 'Join' | 'Exit';

export interface PoolActivity {
  amounts: string[];
  timestamp: number;
  tx: string;
  type: PoolActivityType;
}

export interface PoolSwap {
  tokenIn: string;
  tokenOut: string;
  tokenAmountIn: string;
  tokenAmountOut: string;
  timestamp: number;
  tx: string;
}

export interface PoolSnapshot {
  /*pool: {
    id: string;
  };*/
  timestamp: number;
  amounts: string[];
  totalShares: string;
  swapVolume: string;
  swapFees: string;
  liquidity: string;
}

export type PoolSnapshots = Record<number, PoolSnapshot>;

export type TradePairSnapshot = {
  timestamp: number;
  totalSwapFee: string;
  totalSwapVolume: string;
  pair: {
    token0: {
      symbol: string;
      address: string;
    };
    token1: {
      symbol: string;
      address: string;
    };
  };
};

export interface SubgraphBalancer {
  poolCount: number;
  totalLiquidity: number;
  totalSwapFee: number;
  totalSwapVolume: number;
}

export interface SubgraphTokenPrice {
  id: string;
  asset: string;
  amount: string;
  pricingAsset: string;
  price: string;
  priceUSD: string;
  block: string;
  timestamp: number;
}

export interface SubgraphSwap {
  id: string;
  tokenIn: string;
  tokenInSym: string;
  tokenOut: string;
  tokenOutSym: string;
  tokenAmountIn: string;
  tokenAmountOut: string;
  poolId: {
    id: string;
  };
  userAddress: {
    id: string;
  };
  timestamp: number;
}
