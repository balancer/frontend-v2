<template>
  <Layout class="mt-4">
    <template v-slot:content-left>
      <div class="px-4 md:px-0">
        <Breadcrumb />
        <div class="overflow-hidden">
          <div class="float-left mr-3">
            <Pie
              :data="[
                { name: 'BAL', color: '#0073FF', color2: '#76DFFF', value: 50 },
                { name: 'ETH', color: '#29177F', color2: '#BA86E4', value: 30 },
                { name: 'DAI', color: '#FFB932', color2: '#FF5918', value: 20 }
              ]"
              width="60"
              height="60"
            />
          </div>
          <h1 class="mb-5">V1 Pool {{ _shorten(id) }}</h1>
        </div>
      </div>
      <div v-if="loading || registry.loading" class="px-4 md:px-0">
        <BalLoadingIcon />
      </div>
      <div v-else>
        <div class="mb-5 relative">
          <div class="text-right">
            <a @click="loadMarketCharts(1)" class="mr-2">
              <UiLabel :class="marketChartsDays === 1 && 'active'"
                >1 {{ $t('day') }}
              </UiLabel>
            </a>
            <a @click="loadMarketCharts(7)" class="mr-2">
              <UiLabel :class="marketChartsDays === 7 && 'active'"
                >1 {{ $t('week').toLowerCase() }}
              </UiLabel>
            </a>
            <a @click="loadMarketCharts(30)" class="mr-2">
              <UiLabel :class="marketChartsDays === 30 && 'active'"
                >1 {{ $t('month') }}
              </UiLabel>
            </a>
            <a @click="loadMarketCharts(90)" class="mr-2">
              <UiLabel :class="marketChartsDays === 90 && 'active'"
                >3 {{ $t('months') }}
              </UiLabel>
            </a>
            <a @click="loadMarketCharts(180)" class="mr-2">
              <UiLabel :class="marketChartsDays === 180 && 'active'"
                >6 {{ $t('months') }}
              </UiLabel>
            </a>
          </div>
          <BalLoadingIcon v-if="marketChartsLoading" class="absolute mt-n4" />
          <Chart :key="i" :marketCharts="marketCharts" @click="redrawCharts" />
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
import { mapState } from 'vuex';
import { formatMarketChartData } from '@/utils/chart';

export default {
  data() {
    return {
      i: 0,
      id: this.$route.params.id,
      loading: false,
      marketCharts: {},
      marketChartsDays: 180,
      marketChartsLoading: false,
      poolTokens: []
    };
  },

  computed: {
    ...mapState({
      blockNumber: state => state.web3.blockNumber
    })
  },

  methods: {
    async loadMarketCharts(days) {
      this.marketChartsLoading = true;
      this.marketChartsDays = days;
      const network = '1'; // this.web3.config.key;
      this.poolTokens = await getPoolTokens(network, this.id);
      this.marketChartsRaw = await Promise.all([
        getBPTMarketChart(network, this.blockNumber, this.id, days),
        ...this.poolTokens.map(token =>
          getTokenMarketChart(network, this.blockNumber, token, days)
        )
      ]);
      // TODO: get more information on tokens: weight, name, etc
      this.marketCharts = formatMarketChartData(this.marketChartsRaw);
      this.i++;
      this.marketChartsLoading = false;
    },
    redrawCharts(config) {
      this.marketCharts = formatMarketChartData(this.marketChartsRaw, config);
      this.i++;
    }
  },
  async created() {
    this.loading = true;
    await this.loadMarketCharts(180);
    this.loading = false;
  }
};
</script>
