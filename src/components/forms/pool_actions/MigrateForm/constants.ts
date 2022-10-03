import { networkId } from '@/composables/useNetwork';
import { POOLS } from '@/constants/pools';
import { Network } from '@balancer-labs/sdk';
import { keyBy } from 'lodash';

import { PoolMigrationInfo, PoolMigrationType } from './types';

const riskI18nLabelPrefix = 'migratePool.previewModal.riskWarnings.risks';

const GOERLI_POOL_MIGRATIONS: PoolMigrationInfo[] = [
  {
    type: PoolMigrationType.AAVE_BOOSTED_POOL,
    fromPoolId: POOLS.IdsMap.bbAaveUSD?.v1 as string,
    toPoolId: POOLS.IdsMap.bbAaveUSD?.v2 as string,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`,
    ],
    showOldVHint: true,
  },
  {
    type: PoolMigrationType.STABAL3_POOL,
    fromPoolId: POOLS.IdsMap.staBAL as string,
    toPoolId: POOLS.IdsMap.bbAaveUSD?.v2 as string,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`,
    ],
  },
  {
    type: PoolMigrationType.MAI_POOL,
    fromPoolId:
      '0x6a8f9ab364b85725973d2a33cb9aae2dac43b5e30000000000000000000000a6', // mai4
    toPoolId:
      '0xcd04894ddd31a3ec6ec39fa53a4c163b8842bc1a0002000000000000000000a9', //bbaMai
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
    showOldVHint: true,
  },
  {
    type: PoolMigrationType.STABAL3_POOL,
    fromPoolId: POOLS.IdsMap.staBAL as string,
    toPoolId: POOLS.IdsMap.bbAaveUSD?.v2 as string,
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`,
    ],
  },
];

// TO-DO turn on POLYGON migrations after adding generalised ComposableStable support
const POLYGON_POOL_MIGRATIONS: PoolMigrationInfo[] = [
  {
    type: PoolMigrationType.XMATIC_POOL,
    fromPoolId: POOLS.IdsMap.xMatic?.v1 as string,
    toPoolId: POOLS.IdsMap.xMatic?.v2 as string,
    showOldVHint: true,
  },
  {
    type: PoolMigrationType.STMATIC_POOL,
    fromPoolId: POOLS.IdsMap.stMatic?.v1 as string,
    toPoolId: POOLS.IdsMap.stMatic?.v2 as string,
    showOldVHint: true,
  },
  {
    type: PoolMigrationType.MAI_POOL,
    fromPoolId: POOLS.IdsMap.mai4?.mai4 as string, // mai4
    toPoolId: POOLS.IdsMap.mai4?.maiBbaUsd as string, // bbaMai
    riskI18nLabels: [
      `${riskI18nLabelPrefix}.loseUSDPeg`,
      `${riskI18nLabelPrefix}.aaveStableExploit`,
    ],
  },
];

const MIGRATIONS_BY_NETWORK = {
  [Network.GOERLI]: GOERLI_POOL_MIGRATIONS,
  [Network.MAINNET]: MAINNET_POOL_MIGRATIONS,
  // TO-DO turn on POLYGON migrations after adding generalised ComposableStable support
  [Network.POLYGON]: POLYGON_POOL_MIGRATIONS,
};

export const POOL_MIGRATIONS: PoolMigrationInfo[] = MIGRATIONS_BY_NETWORK[
  networkId.value
]
  ? MIGRATIONS_BY_NETWORK[networkId.value]
  : [];

export const POOL_MIGRATIONS_MAP = keyBy(POOL_MIGRATIONS, 'fromPoolId');
