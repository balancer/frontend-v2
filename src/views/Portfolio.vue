<template>
  <div class="container mx-auto max-w-5xl">
    <SubNav class="mb-8" />
    <div class="mt-16">
      <bal-chart />
    </div>
    <!-- <Block v-if="account">
      <div class="mx-4 md:mx-0">
        <h2 v-text="t('myInvestments')" class="mb-4" />
        <BalLoadingIcon v-if="!loaded" />
      </div>
      <div v-if="loaded">
        <div v-if="pools.length > 0">
          <TablePortfolioPools :pools="pools" />
          <div class="border-t mt-4">
            <a class="mt-8 mx-4 md:mx-0 max-w-sm text-base block">
              <div v-text="t('investmentPoolsAbout')" class="mb-2" />
              <div v-text="t('investmentPoolsAboutLink')" class="font-bold" />
            </a>
          </div>
        </div>
        <div v-else class="border-t mt-4">
          <router-link
            :to="{ name: 'home' }"
            class="mt-8 mx-4 md:mx-0 max-w-sm text-base block"
          >
            <div v-text="t('emptyInvestmentPools')" class="mb-2" />
            <div v-text="t('emptyInvestmentPoolsLink')" class="font-bold" />
          </router-link>
        </div>
      </div>
    </Block> -->
    <!-- <BlockMyWallet v-if="account" :loading="loading" /> -->
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onBeforeMount,
  watch,
} from 'vue';
import { useStore } from 'vuex';
import { getPoolsWithShares } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';
import { getPoolSharesChart } from '@/utils/balancer/subgraph';
import { clone } from '@/utils';
import useNumbers from '@/composables/useNumbers';
import { useI18n } from 'vue-i18n';
import SubNav from '@/components/navs/SubNav.vue';
import useWeb3 from '@/composables/useWeb3';
import BalChart from '@/components/_global/BalChart/BalChart.vue';

export default defineComponent({
  components: {
    SubNav,
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { t } = useI18n();
    const { account, blockNumber, loading: isWeb3Loading } = useWeb3();

    // DATA
    const data = reactive({
      poolSharesChart: {},
      loaded: false,
      pools: [],
      totalBalance: 0,
    });

    // COMPUTED
    const networkKey = computed(() => store.state.web3.config.key);
    const tokens = computed(() => store.getters['registry/getTokens']());

    const isLoading = computed(() => {
      return (
        store.state.web3.loading ||
        (store.state.account.loading && !store.state.account.loaded)
      );
    });

    const isAppLoading = computed(() => store.state.app.loading);
    const isPageLoading = computed(
      () => isAppLoading.value || isLoading.value || isWeb3Loading.value
    );

    watch(data, () => console.log('d', data.poolSharesChart))
    // METHODS
    const injectTokens = (tokens) =>
      store.dispatch('registry/injectTokens', tokens);

    async function load() {
      if (account.value) {
        const provider = getProvider(networkKey.value);

        data.pools = await getPoolsWithShares(
          networkKey.value,
          provider,
          account.value
        );

        data.poolSharesChart = await getPoolSharesChart(
          networkKey.value,
          blockNumber.value,
          account.value,
          30
        );

        data.totalBalance = clone(data.poolSharesChart.series[0].data)
          .slice(-1)
          .pop();

        const tokens = data.pools
          .map((pool) => pool.tokens)
          .reduce((a, b) => [...a, ...b], []);
        await injectTokens(tokens);
      }
      data.loaded = true;
    }

    // WATCHERS
    watch(networkKey, () => load());
    watch(account, () => load());
    watch(data, () => console.log('lok', data.pools));

    // CALLBACKS
    onBeforeMount(async () => {
      try {
        await load();
      } catch (error) {
        console.error(error);
      }
    });

    return {
      // data
      ...toRefs(data),
      // computed
      account,
      isLoading,
      isWeb3Loading,
      isAppLoading,
      isPageLoading,
      tokens,
      // methods
      fNum,
      t,
    };
  },
});
</script>
