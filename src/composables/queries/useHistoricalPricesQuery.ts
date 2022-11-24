import differenceInDays from 'date-fns/differenceInDays';
import { QueryObserverOptions } from 'react-query/core';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { HistoricalPrices } from '@/services/coingecko/api/price.service';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { poolsStoreService } from '@/services/pool/pools-store.service';

import useNetwork from '../useNetwork';
import usePoolQuery from './usePoolQuery';

/**
 * HELPERS
 */
export default function useHistoricalPricesQuery(
  id: string,
  days?: number,
  options: QueryObserverOptions<HistoricalPrices> = {}
) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const storedPool = poolsStoreService.findPool(id);

  /**
   * QUERY DEPENDENCIES
   */
  const { networkId } = useNetwork();
  const poolQuery = usePoolQuery(id);

  /**
   * COMPUTED
   */
  const pool = computed(() => poolQuery.data.value);
  const enabled = computed(() => !!pool.value?.id || !!storedPool);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.HistoricalPrices(networkId, id);

  const queryFn = async () => {
    if (!pool.value && !storedPool) throw new Error('No pool');

    const createTime = storedPool?.createTime || pool.value?.createTime || 0;
    const tokensList = storedPool?.tokensList || pool.value?.tokensList || [];
    const shapshotDaysNum =
      days || differenceInDays(new Date(), new Date(createTime * 1000));

    /**
     * @description
     * due to coin gecko docs if we query from 1 to 90 days from current time it returns hourly data
     * @see https://www.coingecko.com/en/api/documentation
     */
    const aggregateBy = shapshotDaysNum <= 90 ? 'hour' : 'day';

    return await coingeckoService.prices.getTokensHistorical(
      tokensList,
      shapshotDaysNum,
      1,
      aggregateBy
    );
  };

  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<HistoricalPrices>(queryKey, queryFn, queryOptions);
}
