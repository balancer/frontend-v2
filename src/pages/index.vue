<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <template v-if="isWalletReady">
      <div class="px-4 lg:px-0">
        <BalStack horizontal justify="between" align="center">
          <h3>{{ $t('myV2Investments') }}</h3>
          <BalBtn @click="navigateToCreatePool" color="blue" size="sm">{{
            $t('createAPool.title')
          }}</BalBtn>
        </BalStack>
      </div>
      <PoolsTable
        :isLoading="isLoadingUserPools"
        :data="userPools"
        :noPoolsLabel="$t('noInvestments')"
        showPoolShares
        showMigrationColumn
        :selectedTokens="selectedTokens"
        class="mb-8"
      />
      <div class="px-4 lg:px-0" v-if="!hideV1Links">
        <div class="text-black-600">{{ $t('seeV1BalancerInvestments') }}</div>
        <BalLink :href="EXTERNAL_LINKS.Balancer.PoolsV1Dashboard" external>{{
          $t('goToBalancerV1Site')
        }}</BalLink>
      </div>
      <div class="mb-16" />
    </template>

    <div class="px-4 lg:px-0">
      <h3 class="mb-3">{{ $t('investmentPools') }}</h3>
      <div
        class="flex flex-col md:flex-row w-full justify-between items-end lg:items-center"
      >
        <TokenSearchInput
          v-model="selectedTokens"
          :loading="isLoadingPools"
          @add="addSelectedToken"
          @remove="removeSelectedToken"
          class="w-full md:w-2/3"
        />
        <BalBtn
          @click="navigateToCreatePool"
          color="blue"
          size="sm"
          :class="{ 'mt-4': upToMediumBreakpoint }"
          :block="upToMediumBreakpoint"
        >
          {{ $t('createAPool.title') }}
        </BalBtn>
      </div>
    </div>

    <PoolsTable
      :isLoading="isLoadingPools"
      :data="filteredPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="poolsHasNextPage"
      :isLoadingMore="poolsIsFetchingNextPage"
      @loadMore="loadMorePools"
      :selectedTokens="selectedTokens"
      class="mb-8"
    />
    <div class="px-4 lg:px-0" v-if="!hideV1Links">
      <div class="text-black-600">
        {{ $t('tableShowsBalancerV2Pools') }}
      </div>
      <BalLink :href="EXTERNAL_LINKS.Balancer.PoolsV1Explore" external>{{
        $t('exploreBalancerV1Pools')
      }}</BalLink>
    </div>

    <div v-if="isElementSupported" class="mt-16 p-4 lg:p-0">
      <FeaturedPools />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { EXTERNAL_LINKS } from '@/constants/links';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import FeaturedPools from '@/components/sections/FeaturedPools.vue';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import useBreakpoints from '@/composables/useBreakpoints';

export default defineComponent({
  components: {
    TokenSearchInput,
    PoolsTable,
    FeaturedPools
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
      pools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      poolsQuery
    } = usePools(selectedTokens);
    const { addAlert, removeAlert } = useAlerts();
    const { upToMediumBreakpoint } = useBreakpoints();

    // COMPUTED
    const filteredPools = computed(() =>
      selectedTokens.value.length > 0
        ? pools.value?.filter(pool => {
            return selectedTokens.value.every((selectedToken: string) =>
              pool.tokenAddresses.includes(selectedToken)
            );
          })
        : pools?.value
    );

    const hideV1Links = computed(() => !isV1Supported);

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

    /**
     * METHODS
     */
    function navigateToCreatePool() {
      router.push({ name: 'create-pool' });
    }

    return {
      // data
      filteredPools,
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
      upToMediumBreakpoint,

      //methods
      router,
      loadMorePools,
      addSelectedToken,
      removeSelectedToken,
      navigateToCreatePool,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
