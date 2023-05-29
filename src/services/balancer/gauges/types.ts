export type Address = string;
export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs,
  name?: string
) => Record<string, any>;

export interface SubgraphGauge {
  id: string;
  symbol: string;
  poolId: string;
  totalSupply: string;
  isKilled: boolean;
  factory: {
    id: string;
  };
  isPreferentialGauge: boolean;
  streamer: string;
}

export interface OnchainGaugeData {
  rewardTokens: string[];
  claimableTokens: string;
  claimableRewards: Record<string, string>;
}

export type OnchainGaugeDataMap = Record<string, OnchainGaugeData>;

export type Gauge = SubgraphGauge & OnchainGaugeData;
