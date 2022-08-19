import { networkId } from '@/composables/useNetwork';
import { POOLS } from '@/constants/pools';
import { Network } from '@balancer-labs/sdk';
import { keyBy } from 'lodash';

import { PoolMigrationInfo, PoolMigrationType } from './types';

const riskI18nLabelPrefix = 'migratePool.previewModal.riskWarnings.risks';

const goerlyMigrationPoolAdresses = {
  bbaUSD1: '0x13acd41c585d7ebb4a9460f7c8f50be60dc080cd00000000000000000000005f',
  stabal3: '0xdcdd4a3d36dec8d57594e89763d069a7e9b223e2000000000000000000000062',
  mai4: '0x6a8f9ab364b85725973d2a33cb9aae2dac43b5e30000000000000000000000a6',
  bbaMai: '0xcd04894ddd31a3ec6ec39fa53a4c163b8842bc1a0002000000000000000000a9',
};

const GOERLI_POOL_MIGRATIONS: PoolMigrationInfo[] = [
  {
    type: PoolMigrationType.AAVE_BOOSTED_POOL,
    fromPoolId: goerlyMigrationPoolAdresses.bbaUSD1,
    toPoolId: goerlyMigrationPoolAdresses.bbaUSD1,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`,
    ],
  },
  {
    type: PoolMigrationType.STABAL3_POOL,
    fromPoolId: goerlyMigrationPoolAdresses.stabal3,
    toPoolId: goerlyMigrationPoolAdresses.bbaUSD1,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`,
    ],
  },
  {
    type: PoolMigrationType.MAI_POOL,
    fromPoolId: goerlyMigrationPoolAdresses.mai4,
    toPoolId: goerlyMigrationPoolAdresses.bbaMai,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`,
    ],
  },
];

const MAINNET_POOL_MIGRATIONS: PoolMigrationInfo[] = [
  {
    type: PoolMigrationType.AAVE_BOOSTED_POOL,
    fromPoolId: POOLS.IdsMap.bbAaveUSD?.v1 as string,
    toPoolId: POOLS.IdsMap.bbAaveUSD?.v2 as string,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`,
    ],
  },
];

// export const POOL_MIGRATIONS: PoolMigrationInfo[] = [
//   {
//     type: PoolMigrationType.AAVE_BOOSTED_POOL,
//     fromPoolId: goerlyMigrationPoolAdresses.bbaUSD1,
//     toPoolId: goerlyMigrationPoolAdresses.bbaUSD1,
//     riskI18nLabels: [
//       `${riskI18nLabelPrefix}.loseUSDPeg`,
//       `${riskI18nLabelPrefix}.aaveStableExploit`,
//     ],
//   },
//   {
//     type: PoolMigrationType.STABAL3_POOL,
//     fromPoolId: goerlyMigrationPoolAdresses.stabal3,
//     toPoolId: goerlyMigrationPoolAdresses.bbaUSD1,
//     riskI18nLabels: [
//       `${riskI18nLabelPrefix}.loseUSDPeg`,
//       `${riskI18nLabelPrefix}.aaveStableExploit`,
//     ],
//   },
//   {
//     type: PoolMigrationType.MAI_POOL,
//     fromPoolId: goerlyMigrationPoolAdresses.mai4,
//     toPoolId: goerlyMigrationPoolAdresses.bbaMai,
//     riskI18nLabels: [
//       `${riskI18nLabelPrefix}.loseUSDPeg`,
//       `${riskI18nLabelPrefix}.aaveStableExploit`,
//     ],
//   },
// ];

const MIGRATIONS_BY_NETWORK = {
  [Network.GOERLI]: GOERLI_POOL_MIGRATIONS,
  [Network.MAINNET]: MAINNET_POOL_MIGRATIONS,
};

export const POOL_MIGRATIONS: PoolMigrationInfo[] = MIGRATIONS_BY_NETWORK[
  networkId.value
]
  ? MIGRATIONS_BY_NETWORK[networkId.value]
  : [];

export const POOL_MIGRATIONS_MAP = keyBy(POOL_MIGRATIONS, 'fromPoolId');
