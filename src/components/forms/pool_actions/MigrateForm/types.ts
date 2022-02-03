export enum PoolMigrationType {
  AAVE_BOOSTED_POOL = 'aaveBoostedPool'
}

export type PoolMigrationInfo = {
  type: PoolMigrationType;
  fromPoolId: string;
  toPoolId: string;
  riskI18nLabels?: string[];
};
