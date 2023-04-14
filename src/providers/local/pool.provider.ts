import usePoolDecorationQuery from '@/composables/queries/usePoolDecorationQuery';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import symbolKeys from '@/constants/symbol.keys';
import { Pool } from '@/services/pool/types';
import { safeInject } from '../inject';

function poolProvider(poolId: string) {
  const poolQuery = usePoolQuery(poolId);

  const initialPool = computed((): Pool | undefined => {
    return poolQuery.data.value;
  });

  // Updates onchain data and returns new pool object.
  const { data: decoratedPool, refetch: refetchOnchainPoolData } =
    usePoolDecorationQuery(initialPool);

  // Is the initial pool query loading?
  const isLoadingPool = computed(
    (): boolean => isQueryLoading(poolQuery) || !initialPool.value
  );

  const pool = computed((): Pool | undefined => {
    return decoratedPool.value || initialPool.value;
  });

  return {
    pool,
    isLoadingPool,
    refetchOnchainPoolData,
  };
}

/**
 * Provider setup: response type + symbol.
 */
export type PoolProviderResponse = ReturnType<typeof poolProvider>;
export const PoolProviderSymbol: InjectionKey<PoolProviderResponse> = Symbol(
  symbolKeys.Providers.Pool
);

export function providePool(poolId: string): PoolProviderResponse {
  const _provider = poolProvider(poolId);
  provide(PoolProviderSymbol, _provider);
  return _provider;
}

export function usePool(): PoolProviderResponse {
  return safeInject(PoolProviderSymbol);
}
