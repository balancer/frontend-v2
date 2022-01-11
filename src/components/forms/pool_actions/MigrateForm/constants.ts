import { keyBy } from 'lodash';

import { configService } from '@/services/config/config.service';

import { PoolMigrationType, PoolMigrationInfo } from './types';

const riskI18nLabelPrefix = 'migratePool.previewModal.riskWarnings.risks';

export const POOL_MIGRATIONS: PoolMigrationInfo[] = [
  {
    type: PoolMigrationType.AAVE_BOOSTED_POOL,
    fromPoolId: configService.network.pools.staBAL3,
    toPoolId: configService.network.pools.bbAaveUSD,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`
    ]
  }
];

export const POOL_MIGRATIONS_MAP = keyBy(POOL_MIGRATIONS, 'type');
