import { QueryObserverOptions, useQuery } from '@tanstack/vue-query';
import { computed, reactive, Ref, ref } from 'vue';

import { GraphQLArgs } from '@sobal/sdk';

import QUERY_KEYS from '@/constants/queryKeys';
import { useTokens } from '@/providers/tokens.provider';

import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';

import { tokensListExclBpt, tokenTreeLeafs } from '../usePoolHelpers';

import { POOLS } from '@/constants/pools';
import { configService } from '@/services/config/config.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import PoolRepository from '@/services/pool/pool.repository';

type QueryOptions = QueryObserverOptions<Pool>;

export default function usePoolQuery(
  id: string,
  isEnabled: Ref<boolean> = ref(true),
  options: QueryOptions = {}
) {
  /**
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const poolInfo = poolsStoreService.findPool(id);

  /**
   * COMPOSABLES
   */
  const { injectTokens, tokens } = useTokens();

  const poolRepository = new PoolRepository(tokens);

  /**
   * COMPUTED
   */
  const enabled = computed(() => isEnabled.value);

  /**
   * METHODS
   */

  function getQueryArgs(): GraphQLArgs {
    const queryArgs: GraphQLArgs = {
      chainId: configService.network.chainId,
      where: {
        id: { eq: id?.toLowerCase() },
        totalShares: { gt: -1 }, // Avoid the filtering for low liquidity pools
        poolType: { in: POOLS.IncludedPoolTypes },
      },
    };
    return queryArgs;
  }

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id);

  const queryFn = async () => {
    let pool: Pool;
    if (poolInfo) {
      pool = poolInfo;
    } else {
      pool = await poolRepository.fetch(getQueryArgs());
    }

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
