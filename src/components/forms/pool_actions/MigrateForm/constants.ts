import { keyBy } from 'lodash';

import { PoolMigrationInfo, PoolMigrationType } from './types';

const riskI18nLabelPrefix = 'migratePool.previewModal.riskWarnings.risks';

const GOERLY_bbaUSD1 =
  '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f';
export const POOL_MIGRATIONS: PoolMigrationInfo[] = [
  {
    type: PoolMigrationType.AAVE_BOOSTED_POOL,
    fromPoolId: GOERLY_bbaUSD1,
    toPoolId: GOERLY_bbaUSD1,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`
    ]
  }
];

export const POOL_MIGRATIONS_MAP = keyBy(POOL_MIGRATIONS, 'type');
