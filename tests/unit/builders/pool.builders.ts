import { Pool } from '@/services/pool/types';
import { mock } from 'vitest-mock-extended';

export function aPool(options?: Partial<Pool>): Pool {
  const pool = mock<Pool>();
  const defaults: Partial<Pool> = {};
  return { ...pool, ...defaults, ...options };
}
