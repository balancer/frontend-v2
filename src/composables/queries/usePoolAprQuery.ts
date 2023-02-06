import { QueryObserverOptions } from 'react-query/core';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';

import useNetwork from '../useNetwork';
import usePoolQuery from './usePoolQuery';
import { AprBreakdown } from '@balancer-labs/sdk';
import { getBalancer } from '@/dependencies/balancer-sdk';

export default function usePoolAprQuery(
  id: string,
  options: QueryObserverOptions<AprBreakdown> = {}
) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const storedPool = poolsStoreService.findPool(id);

  /**
   * COMPOSABLES
   */
  const poolQuery = usePoolQuery(id);

  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork();

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id || !!storedPool);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.APR(networkId, id);

  const queryFn = async (): Promise<AprBreakdown> => {
    let _pool: Pool;
    if (storedPool) {
      _pool = storedPool;
    } else if (pool.value) {
      // copy computed pool to avoid mutation warnings
      _pool = { ...pool.value, tokens: [...pool.value.tokens] };
    } else {
      throw new Error('No pool');
    }

    if (_pool?.apr) {
      return _pool.apr;
    }

    _pool.chainId = networkId.value;

    const apr = await getBalancer().pools.apr(_pool);

    return apr;
  };
  const queryOptions = reactive({
    enabled,
    ...options,
  });
  return useQuery<AprBreakdown>(queryKey, queryFn, queryOptions);
}
