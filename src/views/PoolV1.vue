<template>
  <Layout class="mt-4">
    <template slot="content-left">
      <div class="px-4 px-md-0">
        <Breadcrumb />
        <h1 class="mb-4">
          V1 Pool {{ _shorten(id) }}
          <a v-clipboard:copy="id" v-clipboard:success="handleCopy">
            <Icon
              name="copy"
              size="24"
              class="text-gray line-height-0 p-0 m-0"
            />
          </a>
        </h1>
      </div>
      <div v-if="loading || registry.loading" class="px-4 px-md-0">
        <UiLoading />
      </div>
      <div v-else>
        <div class="mb-4 position-relative">
          <div class="text-right">
            <a @click="loadMarketCharts(1)" class="mr-2">
              <UiLabel :class="marketChartsDays === 1 && 'active'"
                >1 day
              </UiLabel>
            </a>
            <a @click="loadMarketCharts(7)" class="mr-2">
              <UiLabel :class="marketChartsDays === 7 && 'active'"
                >1 week
              </UiLabel>
            </a>
            <a @click="loadMarketCharts(30)" class="mr-2">
              <UiLabel :class="marketChartsDays === 30 && 'active'"
                >1 month
              </UiLabel>
            </a>
            <a @click="loadMarketCharts(90)" class="mr-2">
              <UiLabel :class="marketChartsDays === 90 && 'active'"
                >3 months
              </UiLabel>
            </a>
            <a @click="loadMarketCharts(180)" class="mr-2">
              <UiLabel :class="marketChartsDays === 180 && 'active'"
                >6 months
              </UiLabel>
            </a>
          </div>
          <UiLoading
            v-if="marketChartsLoading"
            class="position-absolute mt-n4"
          />
          <Chart
            :key="marketCharts.categories.length"
            :marketCharts="marketCharts"
          />
        </div>
      </div>
    </template>
  </Layout>
</template>

<script>
import {
  getBPTMarketChart,
  getPoolTokens,
  getTokenMarketChart
} from '@/utils/balancer/subgraph';
import { mapActions } from 'vuex';
import { formatMarketChartData } from '@/utils/chart';
import getProvider from '@/utils/provider';

export default {
  data() {
    return {
      id: this.$route.params.id,
      loading: false,
      marketCharts: {},
      marketChartsDays: 180,
      marketChartsLoading: false
    };
  },
  methods: {
    ...mapActions(['notify', 'getBlockNumber']),
    handleCopy() {
      this.notify('copied');
    },
    async loadMarketCharts(days) {
      this.marketChartsLoading = true;
      this.marketChartsDays = days;
      const network = '1'; // this.web3.network.key;
      const tokens = await getPoolTokens(network, this.id);
      const blockNumber = await getProvider(network).getBlockNumber(); // this.web3.blockNumber
      const marketCharts = await Promise.all([
        getBPTMarketChart(network, blockNumber, this.id, days),
        ...tokens.map(token =>
          getTokenMarketChart(network, blockNumber, token, days)
        )
      ]);
      // TODO: get more information on tokens: weight, name, etc
      this.marketCharts = formatMarketChartData(marketCharts, tokens);
      this.marketChartsLoading = false;
    }
  },
  async created() {
    this.loading = true;
    await this.getBlockNumber();
    await this.loadMarketCharts(180);
    this.loading = false;
  }
};
</script>
