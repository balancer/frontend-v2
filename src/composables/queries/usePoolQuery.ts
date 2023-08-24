import { QueryObserverOptions, useQuery } from '@tanstack/vue-query';
import { computed, reactive, Ref, ref } from 'vue';

import QUERY_KEYS from '@/constants/queryKeys';
import { useTokens } from '@/providers/tokens.provider';

import { Pool } from '@/services/pool/types';

import { tokensListExclBpt, tokenTreeLeafs } from '../usePoolHelpers';

import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';

type QueryOptions = QueryObserverOptions<Pool>;

export default function usePoolQuery(
  id: string,
  isEnabled: Ref<boolean> = ref(true),
  options: QueryOptions = {}
) {
  /**
   * COMPOSABLES
   */
  const { injectTokens, tokens } = useTokens();

  /**
   * COMPUTED
   */
  const enabled = computed(() => isEnabled.value);

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id);

  const queryFn = async () => {
    let pool: Pool = await await balancerAPIService.pool.get({ id });
    if (!pool) throw new Error('Pool does not exist');

    // If the pool is cached from homepage it may not have onchain set, so update it
    if (!pool.onchain) {
      const poolDecorator = new PoolDecorator([pool]);
      [pool] = await poolDecorator.decorate(tokens.value, false);
    }

    // Inject pool tokens into token registry
    injectTokens([
      ...tokensListExclBpt(pool),
      ...tokenTreeLeafs(pool.tokens),
      pool.address, // We need to inject pool addresses so we can fetch a user's balance for that pool.
    ]);

    return pool;
  };

  const queryOptions = reactive({
    enabled,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    ...options,
  });

  return useQuery<Pool>(queryKey, queryFn, queryOptions as QueryOptions);
}
