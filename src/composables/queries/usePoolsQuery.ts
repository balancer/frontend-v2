import { computed, reactive, ref, Ref } from 'vue';
import { useInfiniteQuery } from 'vue-query';
import { UseInfiniteQueryOptions } from 'react-query/types';
import { flatten } from 'lodash';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import {
  DecoratedPool,
  LinearPool,
  Pool
} from '@/services/balancer/subgraph/types';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useApp from '../useApp';
import { forChange } from '@/lib/utils';
import useNetwork from '../useNetwork';
import { getAddress } from '@ethersproject/address';
import { isStablePhantom, lpTokensFor } from '../usePool';

type PoolsQueryResponse = {
  pools: DecoratedPool[];
  tokens: string[];
  skip?: number;
  enabled?: boolean;
};

type FilterOptions = {
  poolIds?: Ref<string[]>;
  isExactTokensList?: boolean;
  pageSize?: number;
};

export default function usePoolsQuery(
  tokenList: Ref<string[]> = ref([]),
  options: UseInfiniteQueryOptions<PoolsQueryResponse> = {},
  filterOptions?: FilterOptions
) {
  // COMPOSABLES
  const { injectTokens, dynamicDataLoading, prices, getTokens } = useTokens();
  const { currency } = useUserSettings();
  const { appLoading } = useApp();
  const { networkId } = useNetwork();

  // DATA
  const queryKey = QUERY_KEYS.Pools.All(
    networkId,
    tokenList,
    filterOptions?.poolIds
  );

  // COMPUTED
  const enabled = computed(() => !appLoading.value && options.enabled);

  // METHODS
  function removePreMintedBPT(pool: Pool): Pool {
    const poolAddress = balancerSubgraphService.pools.addressFor(pool.id);
    // Remove pre-minted BPT token if exits
    pool.tokensList = pool.tokensList.filter(
      address => address !== poolAddress.toLowerCase()
    );
    return pool;
  }

  /**
   * fetches StablePhantom linear pools and extracts
   * required attributes.
   */
  async function getLinearPoolAttrs(pool: Pool): Promise<Pool> {
    // Fetch linear pools from subgraph
    const pools = await balancerSubgraphService.pools.get();
    const linearPools = pools.filter(
      pool => pool.poolType === 'Linear'
    ) as LinearPool[];
    const linearPoolTokensMap: Pool['linearPoolTokensMap'] = {};

    // Inject main/wrapped tokens into pool schema
    linearPools.forEach(linearPool => {
      if (!pool.wrappedTokens) pool.wrappedTokens = [];

      const index = pool.tokensList.indexOf(linearPool.address.toLowerCase());

      pool.wrappedTokens[index] = getAddress(
        linearPool.tokensList[linearPool.wrappedIndex]
      );

      linearPool.tokens
        .filter(token => token.address !== linearPool.address)
        .forEach(token => {
          const address = getAddress(token.address);

          linearPoolTokensMap[address] = {
            ...token,
            address
          };
        });
    });

    pool.linearPoolTokensMap = linearPoolTokensMap;
    pool.linearPoolToMainTokenMap = linearPools.reduce((map, linearPool) => {
      map[linearPool.address] = linearPool.tokensList[linearPool.mainIndex];
      return map;
    }, {});

    return pool;
  }

  const queryFn = async ({ pageParam = 0 }) => {
    const pools = await balancerSubgraphService.pools.get();

    for (let i = 0; i < pools.length; i++) {
      const isStablePhantomPool = isStablePhantom(pools[i].poolType);

      if (isStablePhantomPool) {
        pools[i] = removePreMintedBPT(pools[i]);
      }

      if (pools[i].linearPools) {
        pools[i] = await getLinearPoolAttrs(pools[i]);
      }
    }

    const tokens = flatten(
      pools.map(pool => [
        ...pool.tokensList,
        ...lpTokensFor(pool),
        balancerSubgraphService.pools.addressFor(pool.id)
      ])
    );

    await injectTokens(tokens);
    await forChange(dynamicDataLoading, false);

    const decoratedPools = await balancerSubgraphService.pools.decorate(pools);

    return {
      pools: decoratedPools,
      tokens,
      skip: undefined
    };
  };

  const queryOptions = reactive({
    enabled,
    getNextPageParam: (lastPage: PoolsQueryResponse) => lastPage.skip,
    ...options
  });

  return useInfiniteQuery<PoolsQueryResponse>(queryKey, queryFn, queryOptions);
}
