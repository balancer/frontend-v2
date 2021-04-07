<template>
  <Container :slim="true" class="mt-6">
    <MainMenu />
    <Block v-if="web3.account">
      <UiLoading v-if="!loaded" class="mx-4 md:mx-0" />
      <div v-else class="mb-4 mx-4 md:mx-0">
        <div class="mb-6 md:mb-0">
          <div>
            <div class="float-right text-base">
              <span v-text="$t('oneDay')" class="ml-4" />
              <span v-text="$t('oneWeek')" class="ml-4" />
              <span v-text="$t('oneMonth')" class="ml-4" />
              <span v-text="$t('threeMonths')" class="ml-4" />
            </div>
            <div class="text-xl font-bold link-color">
              {{ _num(totalBalance, '$0,0.[00]') }}
            </div>
          </div>
          <PoolSharesChart :marketCharts="poolSharesChart" />
        </div>
      </div>
    </Block>
    <Block v-if="web3.account">
      <div class="mx-4 md:mx-0">
        <h2 v-text="$t('myInvestments')" class="mb-4" />
        <UiLoading v-if="!loaded" />
      </div>
      <div v-if="loaded">
        <div v-if="pools.length > 0">
          <TablePortfolioPools :pools="pools" :tokens="tokens" />
          <div class="border-t mt-4">
            <a class="mt-8 mx-4 md:mx-0 max-w-sm text-base block">
              <div v-text="$t('investmentPoolsAbout')" class="mb-2" />
              <div v-text="$t('investmentPoolsAboutLink')" class="font-bold" />
            </a>
          </div>
        </div>
        <div v-else class="border-t mt-4">
          <router-link
            :to="{ name: 'home' }"
            class="mt-8 mx-4 md:mx-0 max-w-sm text-base block"
          >
            <div v-text="$t('emptyInvestmentPools')" class="mb-2" />
            <div v-text="$t('emptyInvestmentPoolsLink')" class="font-bold" />
          </router-link>
        </div>
      </div>
    </Block>
    <BlockMyWallet v-if="web3.account" :loading="loading" />
  </Container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { getPoolsWithShares } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';
import { getPoolSharesChart } from '@/utils/balancer/subgraph';
import { clone } from '@/utils';

export default {
  data() {
    return {
      poolSharesChart: {},
      loaded: false,
      pools: []
    };
  },
  watch: {
    'web3.config.key': function() {
      this.load();
    },
    'web3.account': function() {
      this.load();
    }
  },
  computed: {
    ...mapGetters(['getTokens']),
    loading() {
      return (
        this.web3.loading ||
        (this.account.loading && !this.account.loaded) ||
        this.registry.loading
      );
    },
    tokens() {
      return this.getTokens();
    }
  },
  methods: {
    ...mapActions(['getBlockNumber', 'injectTokens']),
    async load() {
      const account = this.web3.account;
      if (account) {
        const network = this.web3.config.key;
        const provider = getProvider(network);
        const currentBlockNumber = this.web3.blockNumber;

        this.pools = await getPoolsWithShares(network, provider, account);

        this.poolSharesChart = await getPoolSharesChart(
          network,
          currentBlockNumber,
          account,
          30
        );

        this.totalBalance = clone(this.poolSharesChart.series[0].data)
          .slice(-1)
          .pop();

        const tokens = this.pools
          .map(pool => pool.tokens)
          .reduce((a, b) => [...a, ...b], []);
        await this.injectTokens(tokens);
      }
      this.loaded = true;
    }
  },
  async created() {
    await this.getBlockNumber();
    if (this.web3.account) await this.load();
  }
};
</script>
