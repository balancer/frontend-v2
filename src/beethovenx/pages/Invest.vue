<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import BalTabs from '@/components/_global/BalTabs/BalTabs.vue';
import InvestFeaturedPoolsCard from '@/beethovenx/components/pages/invest/InvestFeaturedPoolsCard.vue';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';
import TokenSearchInput from '@/beethovenx/components/pages/invest/TokenSearchInput.vue';
import usePoolList from '@/beethovenx/composables/usePoolList';
import useUserPoolData from '@/beethovenx/composables/useUserPoolData';

const tabs = [
  { value: 'beethovenx-pools', label: 'Incentivized Pools' },
  { value: 'community-pools', label: 'Community Pools' },
  { value: 'my-investments', label: 'My Investments' }
];

const activeTab = ref(tabs[0].value);
const activeFilters = ref<string[]>([]);
const router = useRouter();
const { t } = useI18n();
const { isWalletReady } = useWeb3();
const {
  selectedTokens,
  addSelectedToken,
  removeSelectedToken
} = usePoolFilters();

const { addAlert, removeAlert } = useAlerts();
const { beethovenxConfig, beethovenxConfigLoading } = useBeethovenxConfig();

const {
  featuredPools,
  poolListLoading,
  filteredIncentivizedPools,
  filteredCommunityPools,
  poolListQuery
} = usePoolList(activeFilters, selectedTokens);

const { userPoolList, userPoolDataLoading } = useUserPoolData();

const hasUnstakedBpt = computed(
  () => userPoolList.value.filter(item => item.hasUnstakedBpt).length > 0
);

function goToPoolCreate() {
  router.push({ name: 'pool-create' });
}

function toggleFilter(filterId: string) {
  if (activeFilters.value.includes(filterId)) {
    activeFilters.value = activeFilters.value.filter(id => id !== filterId);
  } else {
    activeFilters.value.push(filterId);
  }
}

watch(poolListQuery.error, () => {
  if (poolListQuery.error.value) {
    addAlert({
      id: 'pools-fetch-error',
      label: t('alerts.pools-fetch-error'),
      type: AlertType.ERROR,
      persistent: true,
      action: poolListQuery.refetch.value,
      actionLabel: t('alerts.retry-label'),
      priority: AlertPriority.MEDIUM
    });
  } else {
    removeAlert('pools-fetch-error');
  }
});
</script>

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
      :isLoading="poolListLoading || beethovenxConfigLoading"
    />
    <div class="mb-8">
      <BalTabs v-model="activeTab" :tabs="tabs" no-pad class="-mb-px" />
    </div>
    <TokenSearchInput
      v-model="selectedTokens"
      :loading="poolListLoading"
      :activeTab="activeTab"
      :filters="beethovenxConfig.poolFilters"
      :active-filters="activeFilters"
      @add="addSelectedToken"
      @remove="removeSelectedToken"
      @toggleFilter="toggleFilter"
    />
    <PoolsTable
      v-if="activeTab === 'beethovenx-pools'"
      :isLoading="poolListLoading"
      :data="filteredIncentivizedPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="false"
      :isLoadingMore="false"
      @loadMore="() => {}"
    />
    <PoolsTable
      v-if="activeTab === 'community-pools'"
      :isLoading="poolListLoading"
      :data="filteredCommunityPools"
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
          description="If you deposit your BPT into the farm, you will earn additional rewards."
          type="warning"
          size="sm"
          class=""
        />
      </div>
      <PoolsTable
        v-if="activeTab === 'my-investments'"
        :isLoading="userPoolDataLoading || poolListLoading"
        :data="userPoolList"
        :noPoolsLabel="$t('noInvestments')"
        showPoolShares
        :selectedTokens="selectedTokens"
        class="mb-8"
      />
    </template>
  </div>
</template>
