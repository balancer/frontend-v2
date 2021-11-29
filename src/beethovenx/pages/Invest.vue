<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <template v-if="isWalletReady">
      <div class="px-4 lg:px-0">
        <h3 class="mb-2">My Investments</h3>
        <BalAlert
          v-if="hasUnstakedBpt"
          title="You have unstaked BPT in your wallet"
          description="If you deposit your BPT into the farm, you will earn additional rewards paid out in BEETS."
          type="warning"
          size="sm"
          class=""
        />
      </div>
      <PoolsTable
        :isLoading="isLoadingUserPools || isLoadingFarms"
        :data="userPools"
        :noPoolsLabel="$t('noInvestments')"
        showPoolShares
        :selectedTokens="selectedTokens"
        class="mb-8"
      />
      <div class="mb-16" />
    </template>
    <div class="px-4 lg:px-0">
      <h3 class="mb-3">Beethoven-X Investment Pools</h3>
      <TokenSearchInput
        v-model="selectedTokens"
        :loading="isLoadingPools"
        @add="addSelectedToken"
        @remove="removeSelectedToken"
      />
    </div>
    <PoolsTable
      :isLoading="isLoadingPools"
      :data="beethovenPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="false"
      :isLoadingMore="false"
      @loadMore="() => {}"
      class="mb-16"
    />
    <div class="px-4 lg:px-0 mb-3 flex">
      <div class="flex-1">
        <h3>Community Investment Pools</h3>
        <p>
          Investment pools created by the community. Please DYOR before
          investing in any community pool.
        </p>
      </div>
      <BalBtn
        class="hidden lg:block"
        label="Compose a pool"
        @click="goToPoolCreate"
      />
    </div>
    <PoolsTable
      :isLoading="isLoadingPools"
      :data="communityPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="true"
      :isLoadingMore="false"
      class="mb-8"
      :sort-externally="true"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { EXTERNAL_LINKS } from '@/constants/links';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import { BalTableColumnSortData } from '@/components/_global/BalTable/BalTable.vue';

const POOLS_PER_PAGE = 20;

export default defineComponent({
  components: {
    TokenSearchInput,
    PoolsTable
    //FeaturedPools
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
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      poolsQuery,
      isLoadingFarms,
      communityPools,
      beethovenPools
    } = usePools(selectedTokens);
    const { addAlert, removeAlert } = useAlerts();

    const hideV1Links = computed(() => !isV1Supported);

    const hasUnstakedBpt = computed(() =>
      userPools.value.find(pool => pool.farm && parseFloat(pool.shares) > 0)
    );

    function goToPoolCreate() {
      router.push({ name: 'pool-create' });
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
      beethovenPools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,

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
      goToPoolCreate,
      hasUnstakedBpt,
      communityPools,
      isLoadingFarms,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
