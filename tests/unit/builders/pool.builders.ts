import { flatTokenTree } from '@/composables/usePoolHelpers';
import { POOLS } from '@/constants/pools';
import {
  OnchainPoolData,
  OnchainTokenData,
  Pool,
  PoolType,
} from '@/services/pool/types';
import { aPoolToken, aWeightedPool } from '@/__mocks__/weighted-pool';
import { PoolWithMethods, PriceRateProvider } from '@sobal/sdk';
import { mock } from 'vitest-mock-extended';
import { randomAddress, wethAddress } from './address';

export function aPool(...options: Partial<Pool>[]): Pool {
  const pool = mock<Pool>();
  const defaults: Partial<Pool> = aWeightedPool({ owner: POOLS.ZeroAddress });
  return Object.assign(pool, defaults, ...options);
}

export function aVeBalPool(...options: Partial<Pool>[]): Pool {
  const pool = mock<Pool>();
  pool.tokens = [aPoolToken({ symbol: 'veBal' })];
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

export const defaultOnChainBalance = '234';
export function anOnchainPoolData(...options: Partial<OnchainPoolData>[]) {
  const data = mock<OnchainTokenData>();
  data.decimals = 18;
  data.balance = defaultOnChainBalance;
  return Object.assign(data, ...options);
}

export const defaultOnchainBalance = '6';
export function anOnchainTokenData(...options: Partial<OnchainTokenData>[]) {
  const data: OnchainTokenData = {
    name: 'onchain token name',
    symbol: 'onchain token symbol',
    balance: defaultOnchainBalance,
    weight: 50,
    decimals: 18,
    logoURI: '',
  };
  return Object.assign(data, ...options);
}

export function aPriceRateProvider(...options: Partial<PriceRateProvider>[]) {
  const data = mock<PriceRateProvider>();
  return Object.assign(data, ...options);
}

export function addOnChainToPoolData(pool: Pool) {
  const onchainTokens = {};
  flatTokenTree(pool).forEach(
    token => (onchainTokens[token.address] = anOnchainTokenData())
  );
  pool.onchain = anOnchainPoolData({ tokens: onchainTokens });
  return pool;
}
