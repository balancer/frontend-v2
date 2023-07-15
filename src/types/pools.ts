import { BoostedProtocol } from '@/composables/useBoostedPool';
export type FactoryType =
  | 'oracleWeightedPool'
  | 'weightedPool'
  | 'stablePool'
  | 'managedPool'
  | 'liquidityBootstrappingPool'
  | 'boostedPool'
  | 'composableStablePool'
  | 'fx'
  | 'eulerLinear'
  | 'gyroE'
  | 'erc4626Linear';

export type PoolMetadata = {
  name?: string;
  hasIcon?: boolean;
  boosted?: boolean;
  boostedProtocols?: BoostedProtocol[];
};

export enum RiskKey {
  General = 'general-risks',
  Economic = 'economic-risk',
  ToxicToken = 'toxic-token-risk',
  RebaseToken = 'rebasing-tokens',
  Governance = 'governance-risk',
  FlashLoan = 'flash-loans-risk',
  JoinExit = 'join-exit-risk',
  ImpermanentLoss = 'impermanent-loss-risk',
  UI = 'ui-risk',
  Regulatory = 'regulatory-risk',
  PoolType = 'pool-type-risk',
  Oracle = 'oracles',
  Network = 'network-risks',
  Weighted = 'weighted-pools',
  Stable = 'stable-pools',
  ComposableStable = 'composable-pools',
  MetaStable = 'composable-pools',
  Boosted = 'boosted-pools',
  Neonevm = 'neonevm',
  Mutable = 'mutable-attributes-risk',
  Composability = 'composability-risk',
  RateProvider = 'rate-provider-risk',
  RateProviderBridge = 'rate-provider-bridges',
}

export type NamedPools = {
  staBAL: string;
  bbAaveUSD: {
    v1: string;
    v2: string;
    v3: string;
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
  description?: string;
  title?: string;
};

export type NewVersionAvailableDetails = DeprecatedDetails;

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
  ExitViaInternalBalance?: string[];
  BrandedRedirect?: Record<string, string>;
  Deprecated?: Record<string, DeprecatedDetails>;
  NewVersionAvailable?: Record<string, NewVersionAvailableDetails>;
  GaugeMigration?: Record<string, DeprecatedDetails>;
  Migrations?: Record<string, PoolMigrationInfo>;
  Issues?: Partial<Record<PoolWarning, string[]>>;
  Risks?: Record<string, RiskKey[]>;
};

export enum PoolWarning {
  PoolProtocolFeeVulnWarning = 'poolProtocolFeeVulnWarning',
  PoolOwnerVulnWarningGovernanceMigrate = 'poolOwnerVulnWarningGovernanceMigrate',
  PoolOwnerVulnWarningGovernanceWithdraw = 'poolOwnerVulnWarningGovernanceWithdraw',
  PoolOwnerVulnWarningGovernance = 'poolOwnerVulnWarningGovernance',
  PoolOwnerVulnWarningEcosystem = 'poolOwnerVulnWarningEcosystem',
  PoolOwnerVulnWarningEcosystemMigrate = 'poolOwnerVulnWarningEcosystemMigrate',
  RenBTCWarning = 'renBTCWarning',
  EulerBoostedWarning = 'eulerBoostedWarning',
  EulerRecoveryModeWarning = 'eulerRecoveryModeWarning',
}
