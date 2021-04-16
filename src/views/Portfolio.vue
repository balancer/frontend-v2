<template>
  <div class="container mx-auto">
    <SubNav class="mb-8" />

    <Block v-if="account">
      <BalLoadingIcon v-if="!loaded" class="mx-4 md:mx-0" />
      <div v-else class="mb-4 mx-4 md:mx-0">
        <div class="mb-6 md:mb-0">
          <div>
            <div class="float-right text-base">
              <span v-text="t('oneDay')" class="ml-4" />
              <span v-text="t('oneWeek')" class="ml-4" />
              <span v-text="t('oneMonth')" class="ml-4" />
              <span v-text="t('threeMonths')" class="ml-4" />
            </div>
            <div class="text-xl font-bold link-color">
              {{ fNum(totalBalance, 'usd') }}
            </div>
          </div>
          <PoolSharesChart :marketCharts="poolSharesChart" />
        </div>
      </div>
    </Block>
    <Block v-if="account">
      <div class="mx-4 md:mx-0">
        <h2 v-text="t('myInvestments')" class="mb-4" />
        <BalLoadingIcon v-if="!loaded" />
      </div>
      <div v-if="loaded">
        <div v-if="pools.length > 0">
          <TablePortfolioPools :pools="pools" :tokens="tokens" />
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
    </Block>
    <BlockMyWallet v-if="account" :loading="loading" />
  </div>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onBeforeMount,
  watch
} from 'vue';
import { useStore } from 'vuex';
import { getPoolsWithShares } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';
import { getPoolSharesChart } from '@/utils/balancer/subgraph';
import { clone } from '@/utils';
import useNumbers from '@/composables/useNumbers';
import { useI18n } from 'vue-i18n';
import SubNav from '@/components/navs/SubNav.vue';

export default defineComponent({
  components: {
    SubNav
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { t } = useI18n();

    // DATA
    const data = reactive({
      poolSharesChart: {},
      loaded: false,
      pools: [],
      totalBalance: 0
    });

    // COMPUTED
    const account = computed(() => store.state.web3.account);
    const networkKey = computed(() => store.state.web3.config.key);
    const tokens = computed(() => store.getters['registry/getTokens']());
    const blockNumber = computed(() => store.state.web3.blockNumber);

    const loading = computed(() => {
      return (
        store.state.web3.loading ||
        (store.state.account.loading && !store.state.account.loaded)
      );
    });

    // METHODS
    const injectTokens = tokens =>
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
          .map(pool => pool.tokens)
          .reduce((a, b) => [...a, ...b], []);
        await injectTokens(tokens);
      }
      data.loaded = true;
    }

    // WATCHERS
    watch(networkKey, () => load());
    watch(account, () => load());

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
      loading,
      tokens,
      // methods
      fNum,
      t
    };
  }
});
</script>
