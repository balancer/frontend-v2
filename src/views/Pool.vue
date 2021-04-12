<template>
  <div class="container mx-auto mt-4 px-4 lg:px-0">
    <PoolNav class="mt-7 lg:mt-14 mb-8 lg:mb-12" />

    <div v-if="!loading" class="lg:mb-10">
      <h3 class="font-bold mb-2">
        {{ title }}
      </h3>
      <div class="text-sm">{{ poolTypeLabel }}. {{ poolFeeLabel }}.</div>
    </div>

    <div class="px-4">
      <div class="flex flex-wrap -mx-8">
        <div class="order-2 lg:order-1 w-full lg:w-2/3">
          <div class="px-4" v-if="!loading">
            <PoolChart class="mb-10" :prices="prices" :snapshots="snapshots" />
            <PoolBalancesCard
              class="mb-10"
              :tokens="pool.tokens"
              :balances="pool.tokenBalances"
            />
            <TableEvents :tokens="pool.tokens" :events="events" />
          </div>
        </div>
        <div class="order-1 lg:order-2 w-full lg:w-1/3 mt-8 lg:mt-0 lg:px-4">
          <PoolActionsCard
            v-if="pool && !loading"
            class="sticky top-24"
            :pool="pool"
            @on-tx="fetchPool"
          />
        </div>
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
  onBeforeMount
} from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import useNumbers from '@/composables/useNumbers';
import { getTokensHistoricalPrice, HistoricalPrices } from '@/api/coingecko';
import {
  getUserPoolEvents,
  getPoolSnapshots,
  PoolEvents,
  PoolSnapshots
} from '@/api/subgraph';
import PoolActionsCard from '@/components/cards/PoolActionsCard.vue';
import PoolBalancesCard from '@/components/cards/PoolBalancesCard.vue';

interface PoolPageData {
  id: string;
  loading: boolean;
  events: PoolEvents;
  prices: HistoricalPrices;
  snapshots: PoolSnapshots;
}

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

    // DATA
    const data = reactive<PoolPageData>({
      id: route.params.id as string,
      loading: true,
      events: {
        joins: [],
        exits: []
      },
      prices: {},
      snapshots: []
    });

    // COMPUTED
    const pool = computed(() => {
      return store.state.pools.current;
    });

    const allTokens = computed(() => {
      return store.getters['registry/getTokens']();
    });

    const title = computed(() => {
      return pool.value.tokens
        .map((address, index) => {
          const weight = pool.value.weightsPercent[index];
          const token = allTokens.value[address];
          if (!token) return null;

          const symbol = token.symbol;
          return `${fNum(weight, null, '0.')} ${symbol}`;
        })
        .filter(token => token)
        .join(', ');
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

    // CALLBACKS
    onBeforeMount(async () => {
      try {
        await fetchPool();
        loadEvents();
        loadChartData(30);
        data.loading = false;
      } catch (error) {
        console.error(error);
        router.push('/');
      }
    });

    // METHODS
    async function fetchPool(): Promise<void> {
      await store.dispatch('pools/get', data.id);
      await store.dispatch('registry/injectTokens', [
        ...pool.value.tokens,
        pool.value.address
      ]);
    }

    async function loadEvents(): Promise<void> {
      const network = store.state.web3.config.key;
      const account = store.state.web3.account;
      if (account) {
        data.events = await getUserPoolEvents(network, data.id, account);
      }
    }

    async function loadChartData(days: number): Promise<void> {
      const network = store.state.web3.config.key;
      const addresses = pool.value.tokens;
      data.prices = await getTokensHistoricalPrice(network, addresses, days);
      data.snapshots = await getPoolSnapshots(network, data.id, days);
    }

    return {
      // data
      ...toRefs(data),
      // computed
      pool,
      poolTypeLabel,
      poolFeeLabel,
      title,
      // methods
      fNum,
      fetchPool
    };
  }
});
</script>
