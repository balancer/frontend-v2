import { QueryObserverOptions } from 'react-query/core';
import { computed, reactive, Ref, ref } from 'vue';
import { useQuery } from 'vue-query';

import useTokens from '@/composables/useTokens';
import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useApp from '../useApp';
import { isBlocked, lpTokensFor } from '../usePool';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from './useGaugesQuery';

export default function usePoolQuery(
  id: string,
  isEnabled: Ref<boolean> = ref(true),
  options: QueryObserverOptions<Pool> = {}
) {
  /**
   * COMPOSABLES
   */
  const { injectTokens, prices, dynamicDataLoading } = useTokens();
  const { appLoading } = useApp();
  const { account } = useWeb3();
  const { currency } = useUserSettings();
  const { data: subgraphGauges } = useGaugesQuery();
  const { tokens } = useTokens();

  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );

  /**
   * COMPUTED
   */
  const enabled = computed(
    () => !appLoading.value && !dynamicDataLoading.value && isEnabled.value
  );

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id, gaugeAddresses);

  const queryFn = async () => {
    // Fetch basic data from subgraph
    const [pool] = await balancerSubgraphService.pools.get({
      where: {
        id: id.toLowerCase(),
        totalShares_gt: -1, // Avoid the filtering for low liquidity pools
        poolType_not_in: POOLS.ExcludedPoolTypes
      }
    });

    if (isBlocked(pool, account.value)) throw new Error('Pool not allowed');

    // Decorate subgraph data with additional data
    const poolDecorator = new PoolDecorator([pool]);
    const [decoratedPool] = await poolDecorator.decorate(
      subgraphGauges.value || [],
      prices.value,
      currency.value,
      tokens.value
    );

    // Inject pool tokens into token registry
    await injectTokens([
      ...decoratedPool.tokensList,
      ...lpTokensFor(decoratedPool),
      decoratedPool.address
    ]);

    return decoratedPool;
  };

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<Pool>(queryKey, queryFn, queryOptions);
}
