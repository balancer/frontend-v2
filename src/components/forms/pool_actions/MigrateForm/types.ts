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
