<template>
  <div class="container mx-auto max-w-5xl">
    <SubNav class="mb-8" />
    <BalLoadingBlock v-if="isLoadingChartData" class="h-96 mt-16" />
    <div class="mt-16">
      <bal-chart
        v-if="!isLoadingChartData"
        name="Value ($)"
        :axis="portfolioChartData?.axis"
        :data="portfolioChartData?.data"
      />
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
import { getPoolsWithShares } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';
import { getPoolSharesChart } from '@/utils/balancer/subgraph';
import useNumbers from '@/composables/useNumbers';
import { useI18n } from 'vue-i18n';
import SubNav from '@/components/navs/SubNav.vue';
import useWeb3 from '@/composables/useWeb3';
import { useQuery } from 'vue-react-query';
import { isNil } from 'lodash';

export default defineComponent({
  components: {
    SubNav
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { t } = useI18n();
    const { account, blockNumber, loading: isWeb3Loading } = useWeb3();

    // DATA
    const data = reactive({
      loaded: false,
      pools: [],
      totalBalance: 0
    });

    // COMPUTED
    const isPageLoading = computed(
      () => isAppLoading.value || isLoading.value || isWeb3Loading.value
    );
    const networkKey = computed(() => store.state.web3.config.key);
    const tokens = computed(() => store.getters['registry/getTokens']());
    const {
      data: portfolioChartData,
      isLoading: isLoadingChartData
    } = useQuery<any, any>(
      'chartData',
      () =>
        getPoolSharesChart(
          networkKey.value,
          blockNumber.value,
          account.value,
          30
        ),
      {
        enabled:
          !isNil(account) ||
          !isNil(networkKey.value) ||
          !isNil(account.value) ||
          isPageLoading.value
      }
    );

    const isLoading = computed(() => {
      return (
        store.state.web3.loading ||
        (store.state.account.loading && !store.state.account.loaded)
      );
    });

    const isAppLoading = computed(() => store.state.app.loading);

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
      isLoadingChartData,
      portfolioChartData
    };
  }
});
</script>
