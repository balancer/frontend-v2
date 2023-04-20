export type FactoryType =
  | 'oracleWeightedPool'
  | 'weightedPool'
  | 'stablePool'
  | 'managedPool'
  | 'liquidityBootstrappingPool'
  | 'boostedPool'
  | 'composableStablePool'
  | 'fx';

export type PoolMetadata = {
  name: string;
  hasIcon: boolean;
};

export type NamedPools = {
  staBAL: string;
  bbAaveUSD: {
    v1: string;
    v2: string;
  };
  xMatic: {
    v1: string;
    v2: string;
  };
  stMatic: {
    v1: string;
    v2: string;
  };
  mai4: {
    mai4: string;
    maiBbaUsd: string;
  };
  veBAL: string;
};

export type DeprecatedDetails = {
  newPool?: string;
  suggestedPools?: string[];
  joinsDisabled?: boolean;
  stakingDisabled?: boolean;
  description?: string;
};

export type Pools = {
  IdsMap: Partial<NamedPools>;
  Pagination: {
    PerPage: number;
    PerPool: number;
    PerPoolInitial: number;
  };
  BoostsEnabled: boolean;
  DelegateOwner: string;
  ZeroAddress: string;
  DynamicFees: {
    Gauntlet: string[];
  };
  BlockList: string[];
  IncludedPoolTypes: string[];
  Stable: {
    AllowList: string[];
  };
  Investment: {
    AllowList: string[];
  };
  Weighted: {
    AllowList: string[];
  };
  Factories: Record<string, FactoryType>;
  Stakable: {
    // Pools to be included in the voting gauges list.
    VotingGaugePools: string[];
    // Pools that have additional rewards and therefore should be stakable but are not included in the VotingGaugePools list.
    AllowList: string[];
  };
  Metadata: Record<string, PoolMetadata>;
  Deep: string[];
  BoostedApr: string[];
  DisabledJoins: string[];
  BrandedRedirect?: Record<string, string>;
  Deprecated?: Record<string, DeprecatedDetails>;
};
