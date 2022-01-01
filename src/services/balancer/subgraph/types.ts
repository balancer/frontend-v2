import { DecoratedFarm } from '@/beethovenx/services/subgraph/subgraph-types';

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
  LiquidityBootstrapping = 'LiquidityBootstrapping'
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
  hasLiquidityMiningRewards: boolean;
  onchain?: OnchainPoolData;
  createTime: number;
  swapEnabled: boolean;
}

export interface DecoratedPool extends Pool {
  dynamic: {
    period: TimeTravelPeriod;
    volume: string;
    apr: PoolApr;
    fees: string;
    isNewPool: boolean;
  };
}

export interface PoolApr {
  pool: string;
  thirdParty: string;
  liquidityMining: string;
  liquidityMiningBreakdown: { [address: string]: string };
  total: string;
}

export interface OnchainTokenData {
  balance: string;
  weight: string;
  decimals: number;
  //logoURI: string;
  name: string;
  symbol: string;
}

export interface OnchainPoolData {
  tokens: Record<string, OnchainTokenData>;
  totalSupply: string;
  decimals: number;
  swapFee: string;
  amp?: string;
  swapEnabled: boolean;
}

export interface FullPool extends DecoratedPool {
  onchain: OnchainPoolData;
  farm?: DecoratedFarm;
  shares?: string;
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
  farm?: DecoratedFarm;
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
