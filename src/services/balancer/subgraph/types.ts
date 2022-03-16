import { BigNumber } from 'ethers';

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
  LiquidityBootstrapping = 'LiquidityBootstrapping'
}
export type TimeTravelPeriod = '24h';

export interface PoolToken {
  address: string;
  balance: string;
  weight: string;
  priceRate: string | null;
  symbol?: string;
}

export interface RawPoolTokens {
  balances: BigNumber[];
  lastChangeBlock: BigNumber;
  tokens: string[];
}

export interface Pool {
  id: string;
  address: string;
  poolType: PoolType;
  swapFee: string;
  owner: string;
  factory: string;
  tokens: PoolToken[];
  tokensList: string[];
  tokenAddresses: string[];
  totalLiquidity: string;
  miningTotalLiquidity: string;
  totalShares: string;
  totalSwapFee: string;
  totalSwapVolume: string;
  hasLiquidityMiningRewards: boolean;
  onchain?: OnchainPoolData;
  createTime: number;
  mainTokens?: string[];
  wrappedTokens?: string[];
  linearPoolTokensMap?: Record<string, PoolToken>;
  unwrappedTokens?: string[];
}

export interface LinearPool extends Pool {
  mainIndex: number;
  wrappedIndex: number;
}

export interface DecoratedPool extends Pool {
  dynamic: {
    period: TimeTravelPeriod;
    volume: string;
    apr: {
      pool: string;
      thirdParty: string;
      thirdPartyBreakdown: { [address: string]: string };
      liquidityMining: string;
      liquidityMiningBreakdown: { [address: string]: string };
      total: string;
    };
    fees: string;
    isNewPool: boolean;
  };
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
}
export type LinearPoolDataMap = Record<Address, LinearPoolData>;

export interface FullPool extends DecoratedPool {
  onchain: OnchainPoolData;
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
