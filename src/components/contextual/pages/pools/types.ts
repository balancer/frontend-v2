export type UserGuageShare = {
  id: string;
  gauge: {
    poolId: string;
  };
  balance: string;
};

export type LiquidityGauge = {
  poolId: string;
};

export type UserGuageSharesResponse = {
  gaugeShares: UserGuageShare[];
  liquidityGauges: LiquidityGauge[];
};
