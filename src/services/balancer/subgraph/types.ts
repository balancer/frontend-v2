export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs
) => Record<string, any>;

export type PoolType = 'Weighted' | 'Stable';
export type TimeTravelPeriod = '24h';

export interface PoolToken {
  address: string;
  balance: string;
  weight: string;
}

export interface Pool {
  id: string;
  poolType: PoolType;
  swapFee: string;
  tokens: PoolToken[];
  tokensList: string[];
  totalLiquidity: string;
  totalShares: string;
  totalSwapFee: string;
  totalSwapVolume: string;
}

export interface DecoratedPool extends Pool {
  dynamic: {
    period: TimeTravelPeriod;
    volume: string;
    apy: string;
  };
}

export interface PoolShare {
  poolId: {
    id: string;
  };
  balance: string;
}

export interface DecoratedPoolWithShares extends DecoratedPool {
  shares: string;
}
