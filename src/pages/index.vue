<script setup lang="ts">
import { useQueries } from 'react-query';
import { computed, Ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import AnimatePresence from '@/components/animate/AnimatePresence.vue';
import StakedPoolsTable from '@/components/contextual/pages/pools/StakedPoolsTable.vue';
import UnstakedPoolsTable from '@/components/contextual/pages/pools/UnstakedPoolsTable.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import FeaturedPools from '@/components/sections/FeaturedPools.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import usePools from '@/composables/pools/usePools';
import useQueryStreams from '@/composables/queries/useQueryStream';
import useStreamedPoolsQuery from '@/composables/queries/useStreamedPoolsQuery';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import useBreakpoints from '@/composables/useBreakpoints';
import { isMigratablePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { MIN_FIAT_VALUE_POOL_MIGRATION } from '@/constants/pools';
import { bnum } from '@/lib/utils';
import StakingProvider from '@/providers/local/staking/staking.provider';
import useWeb3 from '@/services/web3/useWeb3';

// COMPOSABLES
const router = useRouter();
const { t } = useI18n();
const { isWalletReady, appNetworkConfig, isWalletConnecting } = useWeb3();
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
const {
  loading: isLoadingTokens,
  dynamicDataLoading,
  priceQueryLoading,
  prices
} = useTokens();

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

const showMigrationColumn = computed(() =>
  userPools.value?.some(pool => {
    return (
      isMigratablePool(pool) &&
      // TODO: this is a temporary solution to allow only big holders to migrate due to gas costs.
      bnum(pool.shares).gt(MIN_FIAT_VALUE_POOL_MIGRATION)
    );
  })
);

// userPools.value[0].shares
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

const migratableUserPools = computed(() => {
  return userPools.value.filter(pool => isMigratablePool(pool));
});

watch(showMigrationColumn, () => console.log(showMigrationColumn.value));

/**
 * METHODS
 */
function navigateToCreatePool() {
  router.push({ name: 'create-pool' });
}

const {
  data,
  dataStates,
  result,
  loadMore,
  currentPage
} = useStreamedPoolsQuery();

// const { data, result, dataStates } = useQueryStreams('esk', {
//   poolNames: {
//     init: true,
//     queryFn: (pools: Ref<any>) => {
//       console.log('dingle', pools.value);
//       return new Promise(resolve => {
//         setTimeout(() => {
//           pools.value = 0;
//           resolve('fetched');
//         }, 2500);
//       });
//     }
//   },
//   dingles: {
//     dependencies: {},
//     queryFn: (pools: Ref<any>) => {
//       console.log('dingle', pools.value);
//       return new Promise(resolve => {
//         setTimeout(() => {
//           pools.value = pools.value += 5;
//           resolve('fetched');
//         }, 7000);
//       });
//     }
//   }
// });
</script>

<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    {{ { dynamicDataLoading, priceQueryLoading } }}
    {{ dataStates }}
    {{ Object.keys(prices).length }}
    <!-- <AnimatePresence
      :isVisible="
        dataStates['basic'] === 'success' &&
          dataStates['liquidity'] === 'success'
      "
    > -->
    bing {{ currentPage }}
    <PoolsTable
      v-if="dataStates['basic'] !== 'loading' && !priceQueryLoading"
      :data="result"
      :noPoolsLabel="$t('noPoolsFound')"
      :isLoadingMore="false"
      @loadMore="loadMore"
      :selectedTokens="selectedTokens"
      class="mb-8"
      :hiddenColumns="['migrate', 'stake']"
      :columnStates="dataStates"
      :isPaginated="true"
    >
    </PoolsTable>
    <!-- </AnimatePresence> -->
    <template v-if="isWalletReady || isWalletConnecting">
      <BalStack vertical>
        <div class="px-4 lg:px-0">
          <BalStack horizontal justify="between" align="center">
            <h3>{{ $t('myInvestments') }}</h3>
          </BalStack>
        </div>
        <BalStack vertical spacing="xl">
          <StakingProvider>
            <UnstakedPoolsTable :userPools="userPools" />
            <StakedPoolsTable :userPools="userPools" />
          </StakingProvider>
          <BalStack vertical spacing="sm" v-if="migratableUserPools.length > 0">
            <h5 class="px-4 lg:px-0">{{ $t('poolsToMigrate') }}</h5>
            <PoolsTable
              :key="migratableUserPools"
              :isLoading="isLoadingUserPools"
              :data="migratableUserPools"
              :noPoolsLabel="$t('noInvestments')"
              showPoolShares
              :selectedTokens="selectedTokens"
              :hiddenColumns="['poolVolume', 'poolValue', 'stake']"
            />
          </BalStack>
        </BalStack>
      </BalStack>
      <div class="mb-16" />
    </template>

    <BalStack vertical>
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
        :hiddenColumns="['migrate', 'stake']"
        :columnStates="dataStates"
      />

      <div v-if="isElementSupported" class="mt-16 p-4 lg:p-0">
        <FeaturedPools />
      </div>
    </BalStack>
  </div>
</template>
