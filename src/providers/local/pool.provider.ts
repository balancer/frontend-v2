import usePoolDecorationQuery from '@/composables/queries/usePoolDecorationQuery';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { isQueryLoading } from '@/composables/queries/useQueryHelpers';
import symbolKeys from '@/constants/symbol.keys';
import { Pool } from '@/services/pool/types';
import { safeInject } from '../inject';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import { useI18n } from 'vue-i18n';
import { useUserData } from '../user-data.provider';

export function poolProvider(poolId: string) {
  const { addAlert, removeAlert } = useAlerts();
  const { t } = useI18n();

  const poolQuery = usePoolQuery(poolId);
  const { userBoostsQuery } = useUserData();
  const { data: poolBoostsMap } = userBoostsQuery;

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

  const userBoost = computed((): string | undefined => {
    if (!poolBoostsMap.value || !poolId) return '1';
    const boost = poolBoostsMap.value[poolId];
    return boost ? boost : '1';
  });

  const pool = computed((): Pool | undefined => {
    const _pool = decoratedPool.value || initialPool.value;
    if (!_pool) return undefined;

    return {
      boost: userBoost.value,
      ..._pool,
    };
  });

  watch(poolQuery.error, () => {
    if (poolQuery.error.value) {
      addAlert({
        id: 'pool-fetch-error',
        label: t('alerts.pool-fetch-error'),
        type: AlertType.ERROR,
        persistent: true,
        action: poolQuery.refetch,
        actionLabel: t('alerts.retry-label'),
        priority: AlertPriority.MEDIUM,
      });
    } else {
      removeAlert('pool-fetch-error');
    }
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
