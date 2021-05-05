<template>
  <div class="container mx-auto px-4 lg:px-0 pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2">
        <BalLoadingBlock v-if="loading" class="h-12 mb-2" />
        <div v-else class="flex items-center">
          <h3 class="font-bold mr-4 capitalize">
            {{ poolTypeLabel }}
          </h3>
          <BalAssetSet :addresses="titleTokens.map(t => t.token)" :size="36" />
        </div>

        <BalLoadingBlock v-if="loading" class="h-10 mb-2" />
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
                {{ fNum(token.weight / 100, 'percent_lg') }}
              </span>
            </div>
          </div>
        </div>

        <BalLoadingBlock v-if="loading" class="h-4" />
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

          <PoolStats :pool="subgraphPool" :loading="isLoadingSubgraphPool" />

          <div>
            <h4 v-text="$t('poolComposition')" class="mb-4" />
            <PoolBalancesCard :pool="pool" :loading="loading || appLoading" />
          </div>

          <div>
            <h4 v-text="$t('activity')" class="mb-4" />
            <TableEvents
              v-if="hasEvents"
              :tokens="pool.tokens"
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
          v-if="loading || appLoading || web3Loading"
          class="h-96 sticky top-24"
        />
        <PoolActionsCard
          v-else
          :pool="pool"
          :missing-prices="missingPrices"
          @on-tx="fetchPool"
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
import useTokens from '@/composables/useTokens';
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
    const { allTokens } = useTokens();
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

    const subgraphPool = computed(() => poolQuery.data.value);
    const isLoadingSubgraphPool = computed(
      () => poolQuery.isLoading.value || poolQuery.isIdle.value
    );

    const pool = computed(() => {
      return store.state.pools.current;
    });

    const titleTokens = computed(() => {
      return pool.value.tokens
        .map((token, i) => {
          return {
            symbol: allTokens.value[token]?.symbol,
            weight: pool.value.weightsPercent[i],
            token
          };
        })
        .sort((a, b) => b.weight - a.weight);
    });

    const poolTypeLabel = computed(() => {
      switch (pool.value.strategy.name) {
        case 'weightedPool':
          return t('weightedPool');
        case 'stablePool':
          return t('stablePool');
        default:
          return '';
      }
    });

    const poolFeeLabel = computed(() => {
      return t('lpsEarnFee', [
        fNum(pool.value.strategy.swapFeePercent / 100, 'percent')
      ]);
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
        const poolTokens = pool.value.tokens.map(t => t.toLowerCase());
        return !poolTokens.every(token => tokensWithPrice.includes(token));
      }
      return false;
    });

    // METHODS
    async function fetchPool(): Promise<void> {
      console.time('loadPool');
      await store.dispatch('pools/get', data.id);
      await store.dispatch('registry/injectTokens', [
        ...pool.value.tokens,
        pool.value.address
      ]);
      console.timeEnd('loadPool');

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
      const addresses = pool.value.tokens;
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
        await fetchPool();
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
        await fetchPool();
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
      subgraphPool,
      isLoadingSubgraphPool,
      titleTokens,
      isAuthenticated,
      hasEvents,
      missingPrices,
      // methods
      fNum,
      fetchPool
    };
  }
});
</script>
