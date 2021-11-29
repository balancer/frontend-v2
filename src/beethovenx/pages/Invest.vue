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
      :data="filteredPools"
      :noPoolsLabel="$t('noPoolsFound')"
      :isPaginated="poolsHasNextPage"
      :isLoadingMore="poolsIsFetchingNextPage"
      @loadMore="loadMorePools"
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
      :isPaginated="poolsHasNextPage"
      :isLoadingMore="poolsIsFetchingNextPage"
      @loadMore="loadMorePools"
      class="mb-8"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import { EXTERNAL_LINKS } from '@/constants/links';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import useBeethovenxConfig from '@/beethovenx/composables/useBeethovenxConfig';
import { useFreshBeets } from '@/beethovenx/composables/stake/useFreshBeets';

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
      pools,
      userPools,
      isLoadingPools,
      isLoadingUserPools,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage,
      poolsQuery,
      poolsWithFarms,
      isLoadingFarms
    } = usePools(selectedTokens);
    const { addAlert, removeAlert } = useAlerts();
    const { beethovenxConfig } = useBeethovenxConfig();
    const {
      fbeetsDecoratedFarm,
      fbeetsApr,
      farmApr,
      totalApr,
      swapApr
    } = useFreshBeets();

    //TODO: this will break down once pagination starts happening
    const communityPools = computed(() => {
      return poolsWithFarms.value?.filter(
        pool => !beethovenxConfig.value.incentivizedPools.includes(pool.id)
      );
    });

    // COMPUTED
    const filteredPools = computed(() => {
      return selectedTokens.value.length > 0
        ? poolsWithFarms.value?.filter(pool => {
            return (
              selectedTokens.value.every((selectedToken: string) =>
                pool.tokenAddresses.includes(selectedToken)
              ) && beethovenxConfig.value.incentivizedPools.includes(pool.id)
            );
          })
        : poolsWithFarms?.value.filter(pool =>
            beethovenxConfig.value.incentivizedPools.includes(pool.id)
          );
    });

    const hideV1Links = computed(() => !isV1Supported);

    const hasUnstakedBpt = computed(() =>
      userPools.value.find(pool => pool.farm && parseFloat(pool.shares) > 0)
    );

    /*const userPoolsWithFbeets = computed(() => {
      const fbeetsPool = pools.value?.find(pool => {
        return (
          pool.address.toLowerCase() ===
          appNetworkConfig.fBeets.poolAddress.toLowerCase()
        );
      });

      if (
        fbeetsPool &&
        fbeetsDecoratedFarm.value &&
        fbeetsDecoratedFarm.value?.share > 0
      ) {
        return [
          {
            ...fbeetsPool,
            name: fbeetsPool.name + ' (fBEETS)',
            hasLiquidityMiningRewards: true,
            farm: fbeetsDecoratedFarm.value,
            tokens: [
              {
                address: appNetworkConfig.fBeets.address,
                balance: '0',
                weight: '1'
              },
              ...fbeetsPool.tokens
            ],
            dynamic: {
              ...fbeetsPool.dynamic,
              apr: {
                pool: `${swapApr.value}`,
                liquidityMining: `${farmApr.value}`,
                total: `${totalApr.value}`,
                thirdParty: `${fbeetsApr.value}`,
                liquidityMiningBreakdown: {}
              }
            }
          },
          ...(userPools.value || [])
        ];
      }

      return userPools.value;
    });*/

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
