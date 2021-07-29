import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { QueryObserverOptions } from 'react-query/core';
import useTokens2 from '@/composables/useTokens2';
import { pick } from 'lodash';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { FullPool } from '@/services/balancer/subgraph/types';
import { POOLS } from '@/constants/pools';
import useApp from '../useApp';

export default function usePoolQuery(
  id: string,
  options: QueryObserverOptions<FullPool> = {}
) {
  /**
   * COMPOSABLES
   */
  const { allTokens, injectTokens } = useTokens2();
  const { appLoading } = useApp();

  /**
   * COMPUTED
   */
  const enabled = computed(() => !appLoading.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id);

  const queryFn = async () => {
    const [pool] = await balancerSubgraphService.pools.getDecorated('24h', {
      where: {
        id: id.toLowerCase(),
        totalShares_gt: -1 // Avoid the filtering for low liquidity pools
      }
    });

    if (pool.poolType === 'Stable' && !POOLS.Stable.AllowList.includes(id)) {
      throw new Error('Pool not allowed');
    }

    injectTokens(pool.tokenAddresses);

    const tokens = pick(allTokens.value, pool.tokenAddresses);
    const onchainData = await balancerContractsService.vault.getPoolData(
      id,
      pool.poolType,
      tokens
    );

    return { ...pool, onchain: onchainData };
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<FullPool>(queryKey, queryFn, queryOptions);
}
