<script setup lang="ts">
import { useRouter } from 'vue-router';

import HomePageHero from '@/components/heros/HomePageHero.vue';
import TokenSearchInput from '@/components/inputs/TokenSearchInput.vue';
import FeaturedProtocols from '@/components/sections/FeaturedProtocols.vue';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePoolFilters from '@/composables/pools/usePoolFilters';
import useBreakpoints from '@/composables/useBreakpoints';
import useNetwork from '@/composables/useNetwork';
import usePools from '@/composables/pools/usePools';
import { lsGet, lsSet } from '@/lib/utils';
import LS_KEYS from '@/constants/local-storage.keys';
import { useIntersectionObserver } from '@vueuse/core';
import { PoolType } from '@/services/pool/types';
import PoolFeatureSelect from '@/components/inputs/PoolFeatureSelect.vue';
import { useTokens } from '@/providers/tokens.provider';
import { PoolAttributeFilter, PoolFeatureFilter } from '@/types/pools';
import UserInvestedInAffectedPoolAlert from '@/pages/recovery-exit/UserInvestedInAffectedPoolAlert.vue';

const featuredProtocolsSentinel = ref<HTMLDivElement | null>(null);
const isFeaturedProtocolsVisible = ref(false);
useIntersectionObserver(featuredProtocolsSentinel, ([{ isIntersecting }]) => {
  if (isIntersecting) {
    isFeaturedProtocolsVisible.value = true;
  }
});

/**
 * STATE
 */
const route = useRoute();
const urlSortParam = route.query?.sort as string | undefined;
const initSortCol =
  urlSortParam || lsGet(LS_KEYS.App.PoolSorting) || 'totalLiquidity';
const sortField = ref('totalLiquidity');
const poolFeatureFilter = ref<PoolFeatureFilter>();
const filterPoolIds = ref<string[]>([]);
const filterPoolTypes = ref<PoolType[]>([]);
const filterPoolAttributes = ref<PoolAttributeFilter[]>([]);

/**
 * COMPOSABLES
 */
const router = useRouter();
const { getToken } = useTokens();
const { appNetworkConfig } = useNetwork();
const isElementSupported = appNetworkConfig.supportsElementPools;
const { selectedTokens, addSelectedToken, removeSelectedToken } =
  usePoolFilters();

const { pools, isLoading, isFetchingNextPage, loadMorePools } = usePools({
  filterTokens: selectedTokens,
  sortField,
  poolIds: filterPoolIds,
  poolTypes: filterPoolTypes,
  poolAttributes: filterPoolAttributes,
});

const { upToMediumBreakpoint } = useBreakpoints();
const { networkSlug, networkConfig } = useNetwork();

const isPaginated = computed(() => pools.value.length >= 10);

/**
 * METHODS
 */
function navigateToCreatePool() {
  router.push({ name: 'create-pool', params: { networkSlug } });
}

function onColumnSort(columnId: string) {
  sortField.value = columnId;
  lsSet(LS_KEYS.App.PoolSorting, columnId);
}

function updatePoolFilters(feature: PoolFeatureFilter | undefined) {
  switch (feature) {
    case PoolFeatureFilter.Weighted:
      filterPoolIds.value = [];
      filterPoolTypes.value = [PoolType.Weighted];
      break;
    case PoolFeatureFilter.Stable:
      filterPoolIds.value = [];
      filterPoolTypes.value = [
        PoolType.Stable,
        PoolType.StablePhantom,
        PoolType.MetaStable,
        PoolType.ComposableStable,
      ];
      break;
    case PoolFeatureFilter.CLP:
      filterPoolIds.value = [];
      filterPoolTypes.value = [PoolType.Gyro2, PoolType.Gyro3, PoolType.GyroE];
      break;
    case PoolFeatureFilter.LBP:
      filterPoolIds.value = [];
      filterPoolTypes.value = [PoolType.LiquidityBootstrapping];
      break;
    default:
      filterPoolIds.value = [];
      filterPoolTypes.value = [];
  }
}

watch(poolFeatureFilter, newPoolFeatureFilter => {
  updatePoolFilters(newPoolFeatureFilter);
});

watch(filterPoolAttributes, newVal => console.log(newVal));
</script>

<template>
  <div>
    <HomePageHero />
    <div class="xl:container xl:px-4 pt-10 md:pt-8 xl:mx-auto">
      <UserInvestedInAffectedPoolAlert />
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
            <BalVStack spacing="md">
              <BalHStack spacing="md">
                <TokenSearchInput
                  v-model="selectedTokens"
                  @add="addSelectedToken"
                  @remove="removeSelectedToken"
                />
                <PoolFeatureSelect
                  v-model:selectedPoolType="poolFeatureFilter"
                  v-model:selectedAttributes="filterPoolAttributes"
                />
              </BalHStack>
              <BalHStack v-if="selectedTokens.length" spacing="sm">
                <BalChip
                  v-for="token in selectedTokens"
                  :key="token"
                  color="white"
                  iconSize="sm"
                  :closeable="true"
                  @closed="removeSelectedToken"
                >
                  <BalAsset :address="token" :size="20" class="flex-auto" />
                  <span class="ml-2">{{ getToken(token)?.symbol }}</span>
                </BalChip>
              </BalHStack>
            </BalVStack>

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
          :data="pools"
          :noPoolsLabel="$t('noPoolsFound')"
          :isLoading="isLoading"
          :selectedTokens="selectedTokens"
          class="mb-8"
          :sortColumn="initSortCol"
          :hiddenColumns="['migrate', 'actions', 'lockEndDate']"
          :isLoadingMore="isFetchingNextPage"
          :isPaginated="isPaginated"
          skeletonClass="pools-table-loading-height"
          @on-column-sort="onColumnSort"
          @load-more="loadMorePools"
        />
        <div ref="featuredProtocolsSentinel" />
        <div
          v-if="isElementSupported && isFeaturedProtocolsVisible"
          class="p-4 xl:p-0 mt-12"
        >
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
