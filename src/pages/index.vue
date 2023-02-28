<script setup lang="ts">
// import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
// import usePoolFilters from '@/composables/pools/usePoolFilters';
import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork from '@/composables/useNetwork';
import useWeb3 from '@/services/web3/useWeb3';
// import usePools from '@/composables/pools/usePools';
import usePoolFilters from '@/composables/pools/usePoolFilters';

// Async loading for bundle size
const HomePageHero = defineAsyncComponent(
  () => import('@/components/heros/HomePageHero.vue')
);
const PoolsTable = defineAsyncComponent(
  () => import('@/components/tables/PoolsTable/PoolsTable.vue')
);

// COMPOSABLES
const router = useRouter();
const { appNetworkConfig } = useWeb3();
const isElementSupported = appNetworkConfig.supportsElementPools;
const { selectedTokens, addSelectedToken, removeSelectedToken } =
  usePoolFilters();

const poolsSortField = ref('totalLiquidity');

// const { pools, isLoading, poolsIsFetchingNextPage, loadMorePools } = usePools(
//   selectedTokens,
//   poolsSortField
// );
// const isLoading = computed(() => true);
const { upToMediumBreakpoint } = useBreakpoints();
const { networkSlug, networkConfig } = useNetwork();

// const isPaginated = computed(() => pools.value.length >= 10);
const isPaginated = computed(() => true);

/**
 * METHODS
 */
function navigateToCreatePool() {
  router.push({ name: 'create-pool', params: { networkSlug } });
}

function onColumnSort(columnId: string) {
  poolsSortField.value = columnId;
}
</script>

<template>
  <div>
    <HomePageHero />
    <div class="xl:container xl:px-4 pt-10 md:pt-8 xl:mx-auto">
      <BalStack vertical>
        <div class="px-4 xl:px-0">
          <div class="flex justify-between items-end mb-2">
            <h3>
              {{ networkConfig.chainName }}
              <span class="lowercase">{{ $t('pools') }}</span>
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
            FILTER
            <!-- FILTER {{ isLoading }} -->

            <!-- <TokenSearchInput
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
            </BalBtn> -->
          </div>
        </div>
        <PoolsTable
          :data="pools"
          :noPoolsLabel="$t('noPoolsFound')"
          :isLoading="isLoading"
          :selectedTokens="selectedTokens"
          class="mb-8"
          :hiddenColumns="['migrate', 'actions', 'lockEndDate']"
          :isLoadingMore="poolsIsFetchingNextPage"
          :isPaginated="isPaginated"
          skeletonClass="pools-table-loading-height"
          @on-column-sort="onColumnSort"
          @load-more="loadMorePools"
        />
        <div v-if="isElementSupported" class="p-4 xl:p-0 mt-16">
          <FeaturedProtocols />
        </div>
      </BalStack>
    </div>
  </div>
</template>

<style>
.pools-table-loading-height {
  height: 40rem;
}
</style>
