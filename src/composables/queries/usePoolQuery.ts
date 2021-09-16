import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import useTokens from '@/composables/useTokens';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { FullPool } from '@/services/balancer/subgraph/types';
import { POOLS } from '@/constants/pools';
import useApp from '../useApp';
import useUserSettings from '../useUserSettings';
import { forChange } from '@/lib/utils';
import { isInvestment, isStableLike } from '../usePool';

export default function usePoolQuery(
  id: string,
  options: QueryObserverOptions<FullPool> = {}
) {
  /**
   * COMPOSABLES
   */
  const { getTokens, injectTokens, prices, dynamicDataLoading } = useTokens();
  const { appLoading } = useApp();
  const { currency } = useUserSettings();

  /**
   * COMPUTED
   */
  const enabled = computed(
    () => !appLoading.value && !dynamicDataLoading.value
  );

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id);

  const queryFn = async () => {
    const [pool] = await balancerSubgraphService.pools.get({
      where: {
        id: id.toLowerCase(),
        totalShares_gt: -1 // Avoid the filtering for low liquidity pools
      }
    });

    if (
      (isStableLike(pool) && !POOLS.Stable.AllowList.includes(id)) ||
      (isInvestment(pool) && !POOLS.Investment.AllowList.includes(id))
    ) {
      throw new Error('Pool not allowed');
    }

    await injectTokens([
      ...pool.tokensList,
      balancerSubgraphService.pools.addressFor(pool.id)
    ]);
    await forChange(dynamicDataLoading, false);

    const onchainData = await balancerContractsService.vault.getPoolData(
      id,
      pool.poolType,
      getTokens(pool.tokenAddresses)
    );

    const [decoratedPool] = await balancerSubgraphService.pools.decorate(
      [{ ...pool, onchain: onchainData }],
      '24h',
      prices.value,
      currency.value
    );

    console.log('onchainData', onchainData);

    return { ...decoratedPool, onchain: onchainData };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<FullPool>(queryKey, queryFn, queryOptions);
}
