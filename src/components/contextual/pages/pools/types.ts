export type UserGuageShare = {
  id: string;
  gauge: {
    poolId: string;
  };
  balance: string;
};

export type LiquidityGauge = {
  id?: string;
  poolId: string;
  shares: {
    balance: string;
  }[];
};

export type UserGuageSharesResponse = {
  gaugeShares: UserGuageShare[];
  liquidityGauges: LiquidityGauge[];
};

export type PoolStakingDataResponse = {
  liquidityGauge: LiquidityGauge;
};
