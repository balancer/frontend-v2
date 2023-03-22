import { Pool } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mock } from 'vitest-mock-extended';
import { POOLS } from '@/constants/pools';
import { AmountIn } from '@/providers/local/join-pool.provider';
import { wethAddress } from './address';

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

// TODO: move builder to a proper file dealing with join/exit builders (that's being done in a parallel PR)
export function anAmountIn(...options: Partial<AmountIn>[]): AmountIn {
  const defaultAmountIn: AmountIn = {
    address: wethAddress,
    value: '10',
    valid: true,
  };
  return Object.assign(defaultAmountIn, ...options);
}
