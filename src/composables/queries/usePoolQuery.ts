import { QueryObserverOptions } from 'react-query/core';
import { computed, reactive, Ref, ref } from 'vue';
import { useQuery } from 'vue-query';

import useTokens from '@/composables/useTokens';
import { POOLS } from '@/constants/pools';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { poolsStoreService } from '@/services/pool/pools-store.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useApp from '../useApp';
import { isBlocked, tokenTreeLeafs } from '../usePool';
import useGaugesQuery from './useGaugesQuery';
import { GraphQLArgs, PoolsFallbackRepository } from '@balancer-labs/sdk';
import { balancerAPIService } from '@/services/balancer/api/balancer-api.service';
import { configService } from '@/services/config/config.service';

export default function usePoolQuery(
  id: string,
  isEnabled: Ref<boolean> = ref(true),
  options: QueryObserverOptions<Pool> = {},
  includeAprs = true
) {
  /**
   * @description
   * If pool is already downloaded, we can use it instantly
   * it may be if user came to pool page from home page
   */
  const poolInfo = poolsStoreService.findPool(id);
  /**
   * COMPOSABLES
   */
  const { injectTokens, dynamicDataLoading } = useTokens();
  const { appLoading } = useApp();
  const { account } = useWeb3();
  const { data: subgraphGauges } = useGaugesQuery();
  const { tokens } = useTokens();
  const gaugeAddresses = computed(() =>
    (subgraphGauges.value || []).map(gauge => gauge.id)
  );

  const balancerApiRepository = initializeDecoratedAPIRepository();
  const subgraphRepository = initializeDecoratedSubgraphRepository();
  const poolsRepository = initializePoolsRepository();

  /**
   * COMPUTED
   */
  const enabled = computed(
    () => !appLoading.value && !dynamicDataLoading.value && isEnabled.value
  );

  /**
   * METHODS
   */

  function initializePoolsRepository(): PoolsFallbackRepository {
    const fallbackRepository = new PoolsFallbackRepository(
      [balancerApiRepository, subgraphRepository],
      {
        timeout: 30 * 1000,
      }
    );
    return fallbackRepository;
  }

  function initializeDecoratedAPIRepository() {
    return {
      fetch: async (): Promise<Pool[]> => {
        return balancerAPIService.pool.get(getQueryArgs());
      },
      get skip(): number {
        return 0;
      },
    };
  }

  function initializeDecoratedSubgraphRepository() {
    return {
      fetch: async (): Promise<Pool[]> => {
        const pools = await balancerSubgraphService.pools.get(getQueryArgs());

        const poolDecorator = new PoolDecorator(pools);
        const decoratedPools = await poolDecorator.decorate(
          tokens.value,
          includeAprs
        );

        return decoratedPools;
      },
      get skip(): number {
        return 0;
      },
    };
  }

  function getQueryArgs(): GraphQLArgs {
    const queryArgs: GraphQLArgs = {
      chainId: configService.network.chainId,
      where: {
        id: { eq: id.toLowerCase() },
        totalShares: { gt: -1 }, // Avoid the filtering for low liquidity pools
        poolType: { not_in: POOLS.ExcludedPoolTypes },
      },
    };
    return queryArgs;
  }

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Pools.Current(id, gaugeAddresses);

  const queryFn = async () => {
    let pool: Pool;
    if (poolInfo) {
      pool = poolInfo;
    } else {
      [pool] = await poolsRepository.fetch();
    }

    if (isBlocked(pool, account.value)) throw new Error('Pool not allowed');

    // Inject pool tokens into token registry
    await injectTokens([
      ...pool.tokensList,
      ...tokenTreeLeafs(pool.tokens),
      pool.address,
    ]);

    return pool;
  };

  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<Pool>(queryKey, queryFn, queryOptions);
}
