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
