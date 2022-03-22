<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <p class="mt-3 text-base text-xl pl-4 text-left font-book">Linear Pools</p>
    <LinearPoolsTable
      :isLoading="isLoadingPools"
      :data="filteredLinearPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="false"
      :isLoadingMore="false"
      @loadMore="() => {}"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { EXTERNAL_LINKS } from '@/constants/links';
import LinearPoolsTable from '@/components/tables/LinearPoolsTable/LinearPoolsTable.vue';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';
import { flatten } from 'lodash';

export default defineComponent({
  components: {
    LinearPoolsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { t } = useI18n();
    const { isWalletReady, isV1Supported, appNetworkConfig } = useWeb3();
    const isElementSupported = appNetworkConfig.supportsElementPools;
    const {
      selectedTokens,
      addSelectedToken,
      removeSelectedToken
    } = usePoolFilters();

    const {
      isLoadingPools,
      isLoadingUserPools,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      poolsQuery,
      isLoadingFarms,
      linearPools
    } = usePools(selectedTokens);

    const { addAlert, removeAlert } = useAlerts();
    const { beethovenxConfig, beethovenxConfigLoading } = useBeethovenxConfig();
    const activeFilters = ref<string[]>([]);

    const hideV1Links = computed(() => !isV1Supported);

    const filteredLinearPools = computed(() => {
      if (activeFilters.value.length === 0 || !linearPools.value) {
        return linearPools.value;
      }

      const selected = beethovenxConfig.value.poolFilters.filter(filter =>
        activeFilters.value.includes(filter.id)
      );
      const poolIds = flatten(selected.map(selected => selected.pools));

      return linearPools.value?.filter(pool => poolIds.includes(pool.id));
    });

    function toggleFilter(filterId: string) {
      if (activeFilters.value.includes(filterId)) {
        activeFilters.value = activeFilters.value.filter(id => id !== filterId);
      } else {
        activeFilters.value.push(filterId);
      }
    }

    watch(poolsQuery.error, () => {
      if (poolsQuery.error.value) {
        addAlert({
          id: 'pools-fetch-error',
          label: t('alerts.pools-fetch-error'),
          type: AlertType.ERROR,
          persistent: true,
          action: poolsQuery.refetch.value,
          actionLabel: t('alerts.retry-label'),
          priority: AlertPriority.MEDIUM
        });
      } else {
        removeAlert('pools-fetch-error');
      }
    });

    return {
      // data
      linearPools,
      isLoadingPools,
      isLoadingUserPools,
      beethovenxConfigLoading,

      // computed
      isWalletReady,
      hideV1Links,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      selectedTokens,
      isElementSupported,

      //methods
      router,
      loadMorePools,
      addSelectedToken,
      removeSelectedToken,
      isLoadingFarms,
      beethovenxConfig,
      toggleFilter,
      activeFilters,
      filteredLinearPools,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
