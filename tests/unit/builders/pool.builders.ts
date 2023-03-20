import { OnchainTokenData, Pool, PoolType } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mock } from 'vitest-mock-extended';
import { POOLS } from '@/constants/pools';
import { AprBreakdown, PriceRateProvider } from '@balancer-labs/sdk';

export function aPool(...options: Partial<Pool>[]): Pool {
  const pool = mock<Pool>();
  const defaults: Partial<Pool> = aWeightedPool();
  return Object.assign(pool, defaults, ...options);
}

export function aVeBalPool(...options: Partial<Pool>[]): Pool {
  const pool = mock<Pool>();
  const veBalPoolId = configService.network.pools.IdsMap.veBAL as string;
  const defaults: Partial<Pool> = aPool({ id: veBalPoolId });
  return Object.assign(pool, defaults, ...options);
}

export function aStablePool(...options: Partial<Pool>[]): Pool {
  const defaultPool = mock<Pool>();
  defaultPool.poolType = PoolType.Stable;
  return Object.assign(defaultPool, ...options);
}

export function aCustomWeightedPool(...options: Partial<Pool>[]): Pool {
  const defaultPool = aWeightedPool();
  defaultPool.poolType = PoolType.Weighted;
  return Object.assign(defaultPool, ...options);
}

export function anOnchainTokenData(...options: Partial<OnchainTokenData>[]) {
  const data = mock<OnchainTokenData>();
  return Object.assign(data, ...options);
  return data;
}

export function aPriceRateProvider(...options: Partial<PriceRateProvider>[]) {
  const data = mock<PriceRateProvider>();
  return Object.assign(data, ...options);
  return data;
}

export function anAprBreakdown(...options: Partial<AprBreakdown>[]) {
  const data = mock<AprBreakdown>();
  return Object.assign(data, ...options);
  return data;
}
