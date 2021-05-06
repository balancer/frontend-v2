<template>
  <div class="container mx-auto px-4 lg:px-0 pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2">
        <BalLoadingBlock v-if="loadingPool" class="h-12 mb-2" />
        <div v-else class="flex items-center">
          <h3 class="font-bold mr-4 capitalize">
            {{ poolTypeLabel }}
          </h3>
          <BalAssetSet :addresses="pool.tokenAddresses" :size="36" />
        </div>

        <BalLoadingBlock v-if="loadingPool" class="h-10 mb-2" />
        <div v-else class="mb-1 mt-3 flex flex-wrap items-center">
          <div class="flex flex-wrap">
            <div
              v-for="(token, i) in titleTokens"
              :key="i"
              class="mr-2 mb-2 flex items-center p-1 bg-gray-50 rounded-lg"
            >
              <span>
                {{ token.symbol }}
              </span>
              <span class="font-medium text-gray-400 text-xs mt-px ml-1">
                {{ fNum(token.weight, 'percent_lg') }}
              </span>
            </div>
          </div>
        </div>

        <BalLoadingBlock v-if="loadingPool" class="h-4" />
        <div v-else class="text-sm">{{ poolFeeLabel }}.</div>

        <BalAlert
          v-if="!loading && !appLoading && missingPrices"
          type="warning"
          :label="$t('noPriceInfo')"
          class="mt-2"
        />
      </div>

      <div class="hidden lg:block" />

      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <PoolChart
            :prices="prices"
            :snapshots="snapshots"
            :loading="loading"
          />

          <PoolStats :pool="pool" :loading="loadingPool" />

          <div>
            <h4 v-text="$t('poolComposition')" class="mb-4" />
            <PoolBalancesCard :pool="pool" :loading="loadingPool" />
          </div>

          <div>
            <h4 v-text="$t('activity')" class="mb-4" />
            <TableEvents
              v-if="hasEvents && pool"
              :tokens="pool.tokensList"
              :events="events"
              :loading="loading || appLoading || web3Loading"
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
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onBeforeMount,
  watch
} from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { getTokensHistoricalPrice, HistoricalPrices } from '@/api/coingecko';

import { POOLS_ROOT_KEY } from '@/constants/queryKeys';

import {
  getPoolEvents,
  getPoolSnapshots,
  PoolEvents,
  PoolSnapshots
} from '@/api/subgraph';
import PoolActionsCard from '@/components/cards/PoolActionsCard/PoolActionsCard.vue';
import PoolBalancesCard from '@/components/cards/PoolBalancesCard.vue';
import useWeb3 from '@/composables/useWeb3';
import useAuth from '@/composables/useAuth';
import { useQueryClient } from 'vue-query';

interface PoolPageData {
  id: string;
  loading: boolean;
  backgroundLoading: boolean;
  events: PoolEvents;
  prices: HistoricalPrices;
  snapshots: PoolSnapshots;
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
    const router = useRouter();
    const { fNum } = useNumbers();
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const poolQuery = usePoolQuery(route.params.id as string);
    const {
      appNetwork,
      account,
      blockNumber,
      loading: web3Loading
    } = useWeb3();

    // DATA
    const data = reactive<PoolPageData>({
      id: route.params.id as string,
      loading: true,
      backgroundLoading: false,
      events: {
        joins: [],
        exits: []
      },
      prices: {},
      snapshots: [],
      refetchQueriesOnBlockNumber: 0
    });

    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);

    const pool = computed(() => poolQuery.data.value);
    const loadingPool = computed(
      () => poolQuery.isLoading.value || poolQuery.isIdle.value
    );

    const titleTokens = computed(() => {
      if (!pool.value) return [];
      return Object.values(pool.value.onchain.tokens).sort(
        (a: any, b: any) => b.weight - a.weight
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

    const hasEvents = computed(() => {
      return (
        data.events &&
        (data.events.joins.length > 0 || data.events.exits.length > 0)
      );
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

    async function loadEvents(): Promise<void> {
      if (account) {
        console.time('loadPoolEvents');
        data.events = await getPoolEvents(appNetwork.id, data.id);
        console.timeEnd('loadPoolEvents');
      }
    }

    async function loadChartData(days: number): Promise<void> {
      if (!pool.value) return;

      const addresses = pool.value.tokensList;
      data.prices = await getTokensHistoricalPrice(
        appNetwork.id,
        addresses,
        days
      );
      data.snapshots = await getPoolSnapshots(appNetwork.id, data.id, days);
    }

    // WATCHERS
    watch(blockNumber, async () => {
      if (!data.loading && !data.backgroundLoading) {
        data.backgroundLoading = true;
        await loadEvents();
        data.backgroundLoading = false;
      }
      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      } else {
        queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', data.id]);
      }
    });

    // CALLBACKS
    onBeforeMount(async () => {
      try {
        await loadEvents();
        loadChartData(30);
        data.loading = false;
      } catch (error) {
        console.error(error);
        router.push('/');
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
      // subgraphPool,
      loadingPool,
      titleTokens,
      isAuthenticated,
      hasEvents,
      missingPrices,
      // methods
      fNum,
      onNewTx
    };
  }
});
</script>
