import { BigNumber } from 'ethers';
import { Address } from '@/types';

export interface Pool {
  id: string;
  address: string;
  poolType: PoolType;
  swapFee: string;
  owner: string;
  factory: string;
  tokens: PoolToken[];
  tokensList: string[];
  totalLiquidity: string;
  totalShares: string;
  totalSwapFee: string;
  totalSwapVolume: string;
  createTime: number;
  name: string;
  symbol: string;
  onchain?: OnchainPoolData;
  mainTokens?: string[];
  wrappedTokens?: string[];
  linearPoolTokensMap?: Record<string, PoolToken>;
  unwrappedTokens?: string[];
  isNew?: boolean;
  volumeSnapshot?: string;
  feesSnapshot?: string;
  apr?: PoolAPRs;
  boost?: string;
}

export enum PoolType {
  Weighted = 'Weighted',
  Investment = 'Investment',
  Stable = 'Stable',
  MetaStable = 'MetaStable',
  StablePhantom = 'StablePhantom',
  ComposableStable = 'ComposableStable',
  LiquidityBootstrapping = 'LiquidityBootstrapping',
  Managed = 'Managed',
}

export interface PoolToken {
  address: string;
  balance: string;
  weight: string;
  priceRate: string | null;
  symbol?: string;
  token: { pool: { poolType: null | PoolType } | null };
}

// PoolToken data from onchain call
export interface RawPoolTokens {
  balances: BigNumber[];
  lastChangeBlock: BigNumber;
  tokens: string[];
}

export interface LinearPool extends Pool {
  mainIndex: number;
  wrappedIndex: number;
}

export type AprRange = { min: string; max: string };
export interface PoolAPRs {
  total: {
    unstaked: string;
    staked: {
      calc: (boost?: string) => string;
      max: string;
      min: string;
    };
  };
  swap: string;
  yield: {
    total: string;
    breakdown: { [address: string]: string };
  };
  staking?: {
    bal: {
      min: string;
      max: string;
    };
    rewards: string;
  };
  veBal?: string;
}

export interface OnchainTokenData {
  balance: string;
  weight: number;
  decimals: number;
  logoURI: string | undefined;
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

export type RawOnchainPoolDataMap = Record<string, RawOnchainPoolData>;

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

export type OnchainPoolDataMap = Record<string, OnchainPoolData>;

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
  unwrappedERC4626Address: string;
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
}
export type LinearPoolDataMap = Record<Address, LinearPoolData>;

export type AnyPool = Pool | PoolWithShares;

export interface PoolShare {
  poolId: {
    id: string;
  };
  balance: string;
}

export interface PoolWithShares extends Pool {
  shares: string;
  bpt: string;
  lockedEndDate?: number;
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
  userAddress: {
    id: string;
  };
  ensName?: string | null;
  ensAvatar?: string | null;
}

export interface PoolSnapshot {
  pool: {
    id: string;
  };
  timestamp: number;
  amounts: string[];
  totalShares: string;
  swapVolume: string;
  swapFees: string;
  liquidity: string;
}

export type PoolSnapshots = Record<number, PoolSnapshot>;
