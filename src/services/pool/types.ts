import { BigNumber } from 'ethers';
import { Address } from '@/types';
import { Pool as SDKPool, PoolToken, PoolType } from '@balancer-labs/sdk';

export type { SubPool, PoolToken } from '@balancer-labs/sdk';
export { PoolType } from '@balancer-labs/sdk';
export interface Pool extends SDKPool {
  tokens: PoolToken[];
  onchain?: OnchainPoolData;
}

export interface RawPoolTokens {
  balances: BigNumber[];
  lastChangeBlock: BigNumber;
  tokens: string[];
}

export interface LinearPool extends Pool {
  mainIndex: number;
  wrappedIndex: number;
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
  isInRecoveryMode: boolean;
  isPaused: boolean;
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

export type BalDetailsTableData = {
  title: string;
  value?: string;
  link?: string;
  tooltip?: string;
  linksList?: {
    link: string;
    title: string;
    tokenSymbol?: string;
    warningText?: string;
  }[];
};

export const allLinearTypes = [
  PoolType.AaveLinear,
  PoolType.Linear,
  PoolType.EulerLinear,
  PoolType.ERC4626Linear,
  PoolType.BeefyLinear,
  PoolType.GearboxLinear,
  PoolType.MidasLinear,
  PoolType.ReaperLinear,
  PoolType.SiloLinear,
  PoolType.TetuLinear,
  PoolType.YearnLinear,
];
