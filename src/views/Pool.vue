<template>
  <div class="container mx-auto px-4 lg:px-0 pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2">
        <BalLoadingBlock v-if="loadingPool" class="h-16" />
        <div v-else class="flex">
          <div class="whitespace-nowrap">
            <h3 class="font-bold mr-4 capitalize">
              {{ poolTypeLabel }}
            </h3>
            <div v-html="poolFeeLabel" class="text-sm text-gray-600 mt-1" />
          </div>
          <div class="flex flex-wrap">
            <div
              v-for="([address, tokenMeta], i) in titleTokens"
              :key="i"
              class="mr-2 mb-2 flex items-center px-2 h-10 bg-gray-50 rounded-lg"
            >
              <BalAsset :address="address" :size="24" />
              <span class="ml-2">
                {{ tokenMeta.symbol }}
              </span>
              <span class="font-medium text-gray-400 text-xs mt-px ml-1">
                {{ fNum(tokenMeta.weight, 'percent_lg') }}
              </span>
            </div>
          </div>
        </div>

        <BalAlert
          v-if="!appLoading && missingPrices"
          type="warning"
          :label="$t('noPriceInfo')"
          class="mt-2"
        />
      </div>

      <div class="hidden lg:block" />

      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <PoolChart
            :prices="historicalPrices"
            :snapshots="snapshots"
            :loading="isLoadingSnapshots"
          />

          <PoolStats :pool="pool" :loading="loadingPool" />

          <div>
            <h4 v-text="$t('poolComposition')" class="mb-4" />
            <PoolBalancesCard :pool="pool" :loading="loadingPool" />
          </div>

          <div>
            <h4 v-text="$t('activity')" class="mb-4" />
            <TablePoolActivities
              v-if="hasPoolActivities && pool"
              :tokens="pool.tokensList"
              :poolActivities="poolActivities"
              :loading="isLoadingPoolActivities"
            />
            <BalBlankSlate
              v-else
              v-text="$t('noInvestmentsPool')"
              class="h-60"
            />
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2">
        <BalLoadingBlock
          v-if="loadingPool || web3Loading"
          class="h-96 sticky top-24"
        />
        <PoolActionsCard
          v-else
          :pool="pool"
          :missing-prices="missingPrices"
          @on-tx="onNewTx"
          class="sticky top-24"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';

import { POOLS_ROOT_KEY } from '@/constants/queryKeys';

import PoolActionsCard from '@/components/cards/PoolActionsCard/PoolActionsCard.vue';
import PoolBalancesCard from '@/components/cards/PoolBalancesCard.vue';
import useWeb3 from '@/composables/useWeb3';
import useAuth from '@/composables/useAuth';
import { useQueryClient } from 'vue-query';
import usePoolActivitiesQuery from '@/composables/queries/usePoolActivitiesQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';

interface PoolPageData {
  id: string;
  refetchQueriesOnBlockNumber: number;
}

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default defineComponent({
  components: {
    PoolActionsCard,
    PoolBalancesCard
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();
    const route = useRoute();
    const { fNum } = useNumbers();
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const poolQuery = usePoolQuery(route.params.id as string);
    const poolActivitiesQuery = usePoolActivitiesQuery(
      route.params.id as string
    );
    const poolSnapshotsQuery = usePoolSnapshotsQuery(
      route.params.id as string,
      30
    );

    const { blockNumber, loading: web3Loading } = useWeb3();

    // DATA
    const data = reactive<PoolPageData>({
      id: route.params.id as string,
      refetchQueriesOnBlockNumber: 0
    });

    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);

    const pool = computed(() => poolQuery.data.value);
    const loadingPool = computed(
      () => poolQuery.isLoading.value || poolQuery.isIdle.value
    );

    const poolActivities = computed(() => poolActivitiesQuery.data.value);
    const isLoadingPoolActivities = computed(
      () => poolActivitiesQuery.isLoading.value
    );
    const hasPoolActivities = computed(() => !!poolActivities.value?.length);

    const snapshots = computed(() => poolSnapshotsQuery.data.value?.snapshots);
    const historicalPrices = computed(
      () => poolSnapshotsQuery.data.value?.prices
    );
    const isLoadingSnapshots = computed(
      () =>
        poolSnapshotsQuery.isLoading.value || poolSnapshotsQuery.isIdle.value
    );

    const titleTokens = computed(() => {
      if (!pool.value) return [];

      return Object.entries(pool.value.onchain.tokens).sort(
        ([, a]: any[], [, b]: any[]) => b.weight - a.weight
      );
    });

    const poolTypeLabel = computed(() => {
      if (!pool.value) return '';

      switch (pool.value.poolType) {
        case 'Weighted':
          return t('weightedPool');
        case 'Stable':
          return t('stablePool');
        default:
          return '';
      }
    });

    const poolFeeLabel = computed(() => {
      if (!pool.value) return '';
      return t('lpsEarnFee', [fNum(pool.value.onchain.swapFee, 'percent')]);
    });

    const missingPrices = computed(() => {
      if (pool.value) {
        const tokensWithPrice = Object.keys(store.state.market.prices);
        return !pool.value.tokensList.every(token =>
          tokensWithPrice.includes(token)
        );
      }
      return false;
    });

    // METHODS
    function onNewTx(): void {
      queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', data.id]);
      data.refetchQueriesOnBlockNumber =
        blockNumber.value + REFETCH_QUERIES_BLOCK_BUFFER;
    }

    // WATCHERS
    watch(blockNumber, async () => {
      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      } else {
        poolQuery.refetch.value();
      }
    });

    return {
      // data
      ...toRefs(data),
      // computed
      appLoading,
      web3Loading,
      pool,
      poolTypeLabel,
      poolFeeLabel,
      historicalPrices,
      snapshots,
      isLoadingSnapshots,
      // subgraphPool,
      loadingPool,
      titleTokens,
      isAuthenticated,
      hasPoolActivities,
      missingPrices,
      isLoadingPoolActivities,
      poolActivities,
      // methods
      fNum,
      onNewTx
    };
  }
});
</script>
