<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import HomePageHero from '@/components/heros/HomePageHero.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useStreamedPoolsQuery from '@/composables/queries/useStreamedPoolsQuery';
import useBreakpoints from '@/composables/useBreakpoints';
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';

// COMPOSABLES
const router = useRouter();
const { appNetworkConfig } = useWeb3();
const isElementSupported = appNetworkConfig.supportsElementPools;
const { selectedTokens, addSelectedToken, removeSelectedToken } =
  usePoolFilters();

const {
  dataStates,
  result: investmentPools,
  loadMore,
  isLoadingMore,
} = useStreamedPoolsQuery(selectedTokens);
const { upToMediumBreakpoint } = useBreakpoints();
const { priceQueryLoading } = useTokens();

const isInvestmentPoolsTableLoading = computed(
  () => dataStates.value['basic'] === 'loading' || priceQueryLoading.value
);

const isPaginated = computed(() => investmentPools.value.length >= 10);

/**
 * METHODS
 */
function navigateToCreatePool() {
  router.push({ name: 'create-pool' });
}
</script>

<template>
  <HomePageHero />
  <div class="xl:container xl:px-4 pt-10 md:pt-12 xl:mx-auto">
    <BalStack vertical>
      <div class="px-4 xl:px-0">
        <div class="flex justify-between items-end mb-8">
          <h3>
            {{ $t('investmentPools') }}
          </h3>
          <BalBtn
            v-if="upToMediumBreakpoint"
            color="blue"
            size="sm"
            outline
            :class="{ 'mt-4': upToMediumBreakpoint }"
            @click="navigateToCreatePool"
          >
            {{ $t('createAPool.title') }}
          </BalBtn>
        </div>

        <div
          class="flex flex-col md:flex-row justify-between items-end lg:items-center w-full"
        >
          <TokenSearchInput
            v-model="selectedTokens"
            class="w-full md:w-2/3"
            @add="addSelectedToken"
            @remove="removeSelectedToken"
          />
          <BalBtn
            v-if="!upToMediumBreakpoint"
            color="blue"
            size="sm"
            outline
            :class="{ 'mt-4': upToMediumBreakpoint }"
            :block="upToMediumBreakpoint"
            @click="navigateToCreatePool"
          >
            {{ $t('createAPool.title') }}
          </BalBtn>
        </div>
      </div>
      <PoolsTable
        :data="investmentPools"
        :noPoolsLabel="$t('noPoolsFound')"
        :isLoadingMore="isLoadingMore"
        :selectedTokens="selectedTokens"
        class="mb-8"
        :hiddenColumns="['migrate', 'actions', 'lockEndDate']"
        :columnStates="dataStates"
        :isPaginated="isPaginated"
        :isLoading="isInvestmentPoolsTableLoading"
        skeletonClass="pools-table-loading-height"
        @load-more="loadMore"
      />
      <div v-if="isElementSupported" class="p-4 xl:p-0 mt-16">
        <FeaturedProtocols />
      </div>
    </BalStack>
  </div>
</template>

<style>
.pools-table-loading-height {
  height: 40rem;
}
</style>
