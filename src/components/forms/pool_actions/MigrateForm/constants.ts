import { networkId } from '@/composables/useNetwork';
import { POOLS } from '@/constants/pools';
import { Network } from '@balancer-labs/sdk';
import { keyBy } from 'lodash';

import { PoolMigrationInfo } from './types';

const GOERLI_POOL_MIGRATIONS: PoolMigrationInfo[] = [];

const MAINNET_POOL_MIGRATIONS: PoolMigrationInfo[] = [];

const POLYGON_POOL_MIGRATIONS: PoolMigrationInfo[] = [];

const SOFT_MIGRATABLE_POOLS = [POOLS.IdsMap.mai4?.mai4];

/**
 * @description
 * Checks if a pool is classified as a soft migration,
 * a soft migration meaning that you can still add liquidity to the current pool
 * and we don't highlight a forced migration for current LPs.
 */
export function isSoftMigratablePool(id: string) {
  return SOFT_MIGRATABLE_POOLS.includes(id);
}

const MIGRATIONS_BY_NETWORK = {
  [Network.GOERLI]: GOERLI_POOL_MIGRATIONS,
  [Network.MAINNET]: MAINNET_POOL_MIGRATIONS,
  [Network.POLYGON]: POLYGON_POOL_MIGRATIONS,
};

export const POOL_MIGRATIONS: PoolMigrationInfo[] = MIGRATIONS_BY_NETWORK[
  networkId.value
]
  ? MIGRATIONS_BY_NETWORK[networkId.value]
  : [];

export const POOL_MIGRATIONS_MAP = keyBy(POOL_MIGRATIONS, 'fromPoolId');
