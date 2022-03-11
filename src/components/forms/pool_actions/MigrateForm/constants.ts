import { keyBy } from 'lodash';

import { PoolMigrationType, PoolMigrationInfo } from './types';
import { POOLS } from '@/constants/pools';

const riskI18nLabelPrefix = 'migratePool.previewModal.riskWarnings.risks';

const poolsIdsMap = POOLS.IdsMap;

export const POOL_MIGRATIONS: PoolMigrationInfo[] = [
  {
    type: PoolMigrationType.AAVE_BOOSTED_POOL,
    fromPoolId: poolsIdsMap?.staBAL ?? '',
    toPoolId: poolsIdsMap?.bbAaveUSD ?? '',
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`
    ]
  }
];

export const POOL_MIGRATIONS_MAP = keyBy(POOL_MIGRATIONS, 'type');
