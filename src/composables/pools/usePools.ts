import { flatten } from 'lodash';
import { computed, Ref, ref, watch } from 'vue';
import { PoolDecorator } from '@/services/pool/decorators/pool.decorator';
import { Pool } from '@/services/pool/types';

import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import useTokens from '../useTokens';
import useUserSettings from '../useUserSettings';
import useGaugesQuery from '../queries/useGaugesQuery';

export default function usePools(tokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  const poolsQuery = usePoolsQuery(tokenList);
  const decoratedPools = ref<Pool[] | undefined>(undefined);
  const { data: subgraphGauges } = useGaugesQuery();
  const { prices, tokens: tokenMeta } = useTokens();
  const { currency } = useUserSettings();

  const rawPools = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.pools))
      : []
  );

  const pools = computed(() => {
    return decoratedPools.value ? decoratedPools : rawPools;
  });

  const tokens = computed(() =>
    poolsQuery.data.value
      ? flatten(poolsQuery.data.value.pages.map(page => page.tokens))
      : []
  );

  const isLoading = computed(
    () => poolsQuery.isLoading.value || poolsQuery.isIdle.value
  );

  const poolsHasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  const poolsIsFetchingNextPage = computed(
    () => poolsQuery.isFetchingNextPage?.value
  );

  // METHODS
  function loadMorePools() {
    poolsQuery.fetchNextPage.value();
  }

  watch(
    () => poolsQuery.data,
    async poolsQueryData => {
      if (!poolsQueryData.value) return;

      const pools = flatten(poolsQueryData.value.pages.map(page => page.pools));

      const poolDecorator = new PoolDecorator(pools);
      decoratedPools.value = await poolDecorator.decorate(
        subgraphGauges.value || [],
        prices.value,
        currency.value,
        tokenMeta.value
      );
    }
  );

  return {
    pools,
    tokens,
    isLoading,
    poolsHasNextPage,
    poolsIsFetchingNextPage,

    // methods
    loadMorePools,
  };
}
