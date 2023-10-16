import QUERY_KEYS from '@/constants/queryKeys';
import useGraphQuery from './useGraphQuery';
import useNetwork from '../useNetwork';
import { configService } from '@/services/config/config.service';

const attrs = {
  id: true,
  bias: true,
  slope: true,
  timestamp: true,
};

export interface LockSnapshot {
  id: string;
  bias: string;
  slope: string;
  timestamp: number;
}

export interface HistoricalLocksQueryResponse {
  lockSnapshots: LockSnapshot[];
}

export function useHistoricalLocksQuery(account: ComputedRef<string>) {
  const { networkId } = useNetwork();

  const useHistoricalLocksQueryEnabled = computed(() => !!account.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Locks.Historical(networkId, account);

  return useGraphQuery<HistoricalLocksQueryResponse>(
    configService.network.subgraphs.gauge,
    queryKey,
    () => ({
      __name: 'HistoricalLocks',
      lockSnapshots: {
        __args: {
          where: {
            user_: {
              id: account.value?.toLowerCase(),
            },
          },
        },
        ...attrs,
      },
    }),
    reactive({
      enabled: useHistoricalLocksQueryEnabled,
      refetchOnWindowFocus: false,
    })
  );
}
