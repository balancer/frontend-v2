export type Address = string;
export type QueryArgs = Record<string, any>;
export type QueryAttrs = Record<string, any>;
export type AdditionalQueryEntities = Record<
  string,
  {
    __args: QueryArgs;
    [key: string]: any;
  }
>;
export type QueryBuilder = (
  args?: QueryArgs,
  attrs?: QueryAttrs,
  additionalEntities?: AdditionalQueryEntities
) => Record<string, any>;

export interface SubgraphGauge {
  id: string;
  symbol: string;
  pool: string;
  totalSupply: string;
  factory: {
    id: string;
  };
}

export interface OnchainGaugeData {
  rewardTokens: string[];
  claimableTokens: string;
  claimableRewards: Record<string, string>;
}

export type OnchainGaugeDataMap = Record<string, OnchainGaugeData>;

export type Gauge = SubgraphGauge & OnchainGaugeData;
