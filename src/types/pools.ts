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
};

export enum PoolMigrationType {
  AAVE_BOOSTED_POOL = 'aaveBoostedPool',
  STABAL3_POOL = 'stabal3Pool',
  MAI_POOL = 'maiPool',
  STMATIC_POOL = 'stmaticPool',
  XMATIC_POOL = 'xmaticPool',
}

export type PoolMigrationInfo = {
  type: PoolMigrationType;
  fromPoolId: string;
  toPoolId: string;
  riskI18nLabels?: string[];
  showOldVHint?: boolean;
};

export type Pools = {
  IdsMap: Partial<NamedPools>;
  Pagination: {
    PerPage: number;
    PerPool: number;
    PerPoolInitial: number;
  };
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
  Factories: Record<string, FactoryType>;
  Stakable: {
    AllowList: string[];
  };
  Metadata: Record<string, PoolMetadata>;
  DisabledJoins: string[];
  BrandedRedirect?: Record<string, string>;
  Deprecated?: Record<string, DeprecatedDetails>;
  Migrations?: Record<string, PoolMigrationInfo>;
};
