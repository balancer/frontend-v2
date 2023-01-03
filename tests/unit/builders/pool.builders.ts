import { Pool } from '@/services/pool/types';
import { PoolMock as WeightedPool } from '@/__mocks__/weighted-pool';
import { mock } from 'vitest-mock-extended';

export function aPool(...options: Partial<Pool>[]): Pool {
  const pool = mock<Pool>();
  const defaults: Partial<Pool> = WeightedPool;
  return Object.assign(pool, defaults, ...options);
}
