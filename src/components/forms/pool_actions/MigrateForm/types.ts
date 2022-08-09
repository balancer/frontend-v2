export enum PoolMigrationType {
  AAVE_BOOSTED_POOL = 'aaveBoostedPool',
  STABAL3_POOL = 'stabal3Pool',
}

export type PoolMigrationInfo = {
  type: PoolMigrationType;
  fromPoolId: string;
  toPoolId: string;
  riskI18nLabels?: string[];
};
