export enum PoolMigrationType {
  AAVE_BOOSTED_POOL = 'aaveBoostedPool',
  BBAUSD_POOL = 'bbaUSDPool',
  STABAL3_POOL = 'stabal3Pool'
}

export type PoolMigrationInfo = {
  type: PoolMigrationType;
  fromPoolId: string;
  toPoolId: string;
  riskI18nLabels?: string[];
};
