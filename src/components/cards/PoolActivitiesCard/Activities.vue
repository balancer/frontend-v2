<template>
  <TablePoolActivities
    v-if="pool && hasPoolActivities"
    :tokens="pool.tokensList"
    :pool-activities="poolActivities"
    :is-loading="isLoadingPoolActivities"
    :is-loading-more="poolActivitiesIsFetchingNextPage"
    :is-paginated="poolActivitiesHasNextPage"
    @load-more="loadMorePoolActivities"
  />
  <BalBlankSlate v-else v-text="$t('noTransactions')" class="h-60" />
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from 'vue';
import { useRoute } from 'vue-router';
import { flatten } from 'lodash';

import usePoolActivitiesQuery from '@/composables/queries/usePoolActivitiesQuery';
import usePoolUserActivitiesQuery from '@/composables/queries/usePoolUserActivitiesQuery';

import { FullPool } from '@/services/balancer/subgraph/types';

import { PoolActivityTab } from './types';

export default defineComponent({
  props: {
    pool: {
      type: Object as PropType<FullPool>,
      required: true
    },
    loading: { type: Boolean, default: false },
    poolActivityType: {
      type: String as PropType<PoolActivityTab>,
      default: PoolActivityTab.ALL_ACTIVITY
    }
  },

  setup(props) {
    // COMPOSABLES
    const route = useRoute();

    const id = route.params.id as string;

    const poolActivitiesQuery =
      props.poolActivityType === PoolActivityTab.ALL_ACTIVITY
        ? usePoolActivitiesQuery(id)
        : usePoolUserActivitiesQuery(id);

    // COMPUTED
    const poolActivities = computed(() =>
      poolActivitiesQuery.data.value
        ? flatten(
            poolActivitiesQuery.data.value.pages.map(
              page => page.poolActivities
            )
          )
        : []
    );

    const isLoadingPoolActivities = computed(
      () => poolActivitiesQuery.isLoading.value
    );

    const hasPoolActivities = computed(() => !!poolActivities.value?.length);

    const poolActivitiesHasNextPage = computed(
      () => poolActivitiesQuery.hasNextPage?.value
    );

    const poolActivitiesIsFetchingNextPage = computed(
      () => poolActivitiesQuery.isFetchingNextPage?.value
    );

    // METHODS
    function loadMorePoolActivities() {
      poolActivitiesQuery.fetchNextPage.value();
    }

    return {
      // computed
      hasPoolActivities,
      isLoadingPoolActivities,
      poolActivities,
      poolActivitiesHasNextPage,
      poolActivitiesIsFetchingNextPage,
      // methods
      loadMorePoolActivities
    };
  }
});
</script>
