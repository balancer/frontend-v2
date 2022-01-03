<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="flex mb-3 items-center">
      <div class="flex-1">
        <img
          src="~@/beethovenx/assets/images/featured-pools.svg"
          class="-ml-4"
        />
      </div>
      <BalBtn
        class="hidden lg:block"
        label="Compose a pool"
        @click="goToPoolCreate"
      />
    </div>
    <InvestFeaturedPoolsCard
      :pools="featuredPools"
      :isLoading="isLoadingPools || beethovenxConfigLoading"
    />
    <div class="mb-8">
      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
    </div>
    <TokenSearchInput
      v-model="selectedTokens"
      :loading="isLoadingPools"
      @add="addSelectedToken"
      @remove="removeSelectedToken"
    />
    <PoolsTable
      v-if="activeTab === 'beethovenx-pools'"
      :isLoading="isLoadingPools"
      :data="beethovenPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="false"
      :isLoadingMore="false"
      @loadMore="() => {}"
    />
    <p class="px-4 lg:px-0 mb-3 mt-4" v-if="activeTab === 'community-pools'">
      Investment pools created by the community. Please DYOR before investing in
      any community pool.
    </p>
    <PoolsTable
      v-if="activeTab === 'community-pools'"
      :isLoading="isLoadingPools"
      :data="communityPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="true"
      :isLoadingMore="false"
      :sort-externally="true"
    />
    <template v-if="isWalletReady">
      <div class="px-4 lg:px-0">
        <BalAlert
          v-if="hasUnstakedBpt && activeTab === 'my-investments'"
          title="You have unstaked BPT in your wallet"
          description="If you deposit your BPT into the farm, you will earn additional rewards paid out in BEETS."
          type="warning"
          size="sm"
          class=""
        />
      </div>
      <PoolsTable
        v-if="activeTab === 'my-investments'"
        :isLoading="isLoadingUserPools || isLoadingFarms"
        :data="userPools"
        :noPoolsLabel="$t('noInvestments')"
        showPoolShares
        :selectedTokens="selectedTokens"
        class="mb-8"
      />
    </template>
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
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import InvestFeaturedPoolsCard from '@/beethovenx/components/pages/invest/InvestFeaturedPoolsCard.vue';
import { orderBy } from 'lodash';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';

export default defineComponent({
  components: {
    InvestFeaturedPoolsCard,
    TokenSearchInput,
    PoolsTable,
    BalTabs
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
      beethovenPools,
      poolsWithFarms
    } = usePools(selectedTokens);
    const { addAlert, removeAlert } = useAlerts();
    const { beethovenxConfig, beethovenxConfigLoading } = useBeethovenxConfig();

    const tabs = [
      { value: 'beethovenx-pools', label: 'Beethoven X Pools' },
      { value: 'community-pools', label: 'Community Pools' },
      { value: 'my-investments', label: 'My Investments' }
    ];

    const activeTab = ref(tabs[0].value);

    const hideV1Links = computed(() => !isV1Supported);

    const hasUnstakedBpt = computed(() =>
      userPools.value.find(pool => pool.farm && parseFloat(pool.shares) > 0)
    );

    const featuredPools = computed(() => {
      const filtered = (poolsWithFarms.value || []).filter(pool =>
        beethovenxConfig.value.featuredPools.includes(pool.id)
      );

      return filtered.slice(0, 4);
    });

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
      goToPoolCreate,
      hasUnstakedBpt,
      communityPools,
      isLoadingFarms,
      tabs,
      activeTab,
      featuredPools,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
