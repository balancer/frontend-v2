<template>
  <div class="flex justify-between items-end border-b px-4 mb-6">
    <BalTabs v-model="activeTab" :tabs="tabs" class="pt-4 -mb-px" no-pad />
  </div>
  <template v-if="activeTab === 'allActivity'">
    <TablePoolActivities
      v-if="pool && hasPoolActivities"
      :tokens="pool.tokensList"
      :poolActivities="poolActivities"
      :isLoading="isLoadingPoolActivities"
      :isLoadingMore="poolActivitiesIsFetchingNextPage"
      :isPaginated="poolActivitiesHasNextPage"
      @loadMore="loadMorePoolActivities"
    />
    <BalBlankSlate v-else v-text="$t('noInvestmentsPool')" class="h-60" />
  </template>
  <template v-if="activeTab === 'userActivity'">
    <TablePoolActivities
      v-if="pool && hasPoolActivities"
      :tokens="pool.tokensList"
      :poolActivities="poolActivities"
      :isLoading="isLoadingPoolActivities"
      :isLoadingMore="poolActivitiesIsFetchingNextPage"
      :isPaginated="poolActivitiesHasNextPage"
      @loadMore="loadMorePoolActivities"
    />
    <BalBlankSlate v-else v-text="$t('noInvestmentsPool')" class="h-60" />
  </template>
</template>

<script lang="ts">
import { defineComponent, computed, PropType, ref } from 'vue';
import { useRoute } from 'vue-router';
import { flatten } from 'lodash';
import { useI18n } from 'vue-i18n';

import usePoolActivitiesQuery from '@/composables/queries/usePoolActivitiesQuery';

import { FullPool } from '@/services/balancer/subgraph/types';

export default defineComponent({
  props: {
    pool: {
      type: Object as PropType<FullPool>,
      required: true
    },
    loading: { type: Boolean, default: false }
  },

  setup() {
    // COMPOSABLES
    const { t } = useI18n();
    const route = useRoute();
    const poolActivitiesQuery = usePoolActivitiesQuery(
      route.params.id as string
    );

    // DATA
    const tabs = [
      { value: 'allActivity', label: t('allTransactions') },
      { value: 'userActivity', label: t('myTransactions') }
    ];
    const activeTab = ref(tabs[0].value);

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
      // data
      tabs,
      activeTab,
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
