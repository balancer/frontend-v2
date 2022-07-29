import { keyBy } from 'lodash';

import { PoolMigrationInfo, PoolMigrationType } from './types';

const riskI18nLabelPrefix = 'migratePool.previewModal.riskWarnings.risks';

const GOERLY_bbaUSD1_address =
  '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f';
const GOERLY_stabal3_address =
  '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062';

export const POOL_MIGRATIONS: PoolMigrationInfo[] = [
  {
    type: PoolMigrationType.AAVE_BOOSTED_POOL,
    fromPoolId: GOERLY_bbaUSD1_address,
    toPoolId: GOERLY_bbaUSD1_address,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`
    ]
  }
  // {
  //   type: PoolMigrationType.AAVE_BOOSTED_POOL,
  //   fromPoolId: GOERLY_stabal3_address,
  //   toPoolId: GOERLY_stabal3_address,
  //   riskI18nLabels: [
  //     `${riskI18nLabelPrefix}.loseUSDPeg`,
  //     `${riskI18nLabelPrefix}.aaveStableExploit`
  //   ]
  // }
];

export const POOL_MIGRATIONS_MAP = keyBy(POOL_MIGRATIONS, 'type');
