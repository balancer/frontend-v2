import { POOLS } from '@/constants/pools';
import { Pool } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { PoolWithMethods } from '@balancer-labs/sdk';
import { mock } from 'vitest-mock-extended';
import { randomAddress, wethAddress } from './address';

export function aPool(...options: Partial<Pool>[]): Pool {
  const pool = mock<Pool>();
  const defaults: Partial<Pool> = aWeightedPool();
  return Object.assign(pool, defaults, ...options);
}

export function aVeBalPool(...options: Partial<Pool>[]): Pool {
  const pool = mock<Pool>();
  const veBalPoolId = POOLS.IdsMap.veBAL as string;
  const defaults: Partial<Pool> = aPool({ id: veBalPoolId });
  return Object.assign(pool, defaults, ...options);
}

export function aPoolWithMethods(
  ...options: Partial<PoolWithMethods>[]
): PoolWithMethods {
  const pool = mock<PoolWithMethods>();
  pool.address = randomAddress();
  pool.tokensList = [wethAddress];
  return Object.assign(pool, ...options);
}
