import { computed, Ref, ref } from 'vue';

import { flatten } from 'lodash';

// import useGaugesQuery from '@/composables/vebal/useGaugesQuery';

export default function useGauges(poolsTokenList: Ref<string[]> = ref([])) {
  // COMPOSABLES
  // const poolsQuery = useGaugesQuery(poolsTokenList);

  // COMPUTED
  const gauges = require('@/constants/gauges.json');

  // const tokens = computed(() =>
  //   poolsQuery.data.value
  //     ? flatten(poolsQuery.data.value.pages.map(page => page.tokens))
  //     : []
  // );

  const isLoadingGauges = false;

  // const poolsHasNextPage = computed(() => poolsQuery.hasNextPage?.value);
  // const poolsIsFetchingNextPage = computed(
  //   () => poolsQuery.isFetchingNextPage?.value
  // );

  // // METHODS
  // function loadMorePools() {
  //   poolsQuery.fetchNextPage.value();
  // }

  return {
    // computed
    gauges,
    // tokens,
    isLoadingGauges,
    // poolsHasNextPage,
    // poolsIsFetchingNextPage,
    // poolsQuery,

    // methods
    // loadMorePools
  };
}
