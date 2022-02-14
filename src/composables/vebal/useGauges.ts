import { computed, Ref, ref } from 'vue';

import { flatten } from 'lodash';

import useGaugesQuery from '@/composables/queries/useGaugesQuery';

export default function useGauges() {
  // COMPOSABLES
  // const gaugesQuery = useGaugesQuery();

  // COMPUTED
  const gauges = require('@/constants/gauges.json');

  // const gauges = computed(() =>
  //   gaugesQuery.data.value
  //     ? flatten(gaugesQuery.data.value.pages.map(page => page.tokens))
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
