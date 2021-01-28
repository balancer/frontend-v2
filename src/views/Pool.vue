<template>
  <Layout class="mt-4">
    <template slot="content-left">
      <div class="px-4 px-md-0">
        <Breadcrumb />
        <h1 class="mb-4">
          Pool {{ _shorten(id) }}
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
          </div>
          <UiLoading
            v-if="marketChartsLoading"
            class="position-absolute mt-n4"
          />
          <Chart :key="marketCharts[0].length" :marketCharts="marketCharts" />
        </div>
        <Block title="Overview">
          <div class="d-flex">
            <div class="flex-auto">
              Pool token name
            </div>
            {{ pool.tokenizer.name }}
            <a @click="addToken" class="ml-1 mb-n1 mr-n1">
              <Icon name="plus" size="22" />
            </a>
          </div>
          <div class="d-flex">
            <div class="flex-auto">
              Total supply
            </div>
            {{
              $n(_units(pool.tokenizer.totalSupply, pool.tokenizer.decimals))
            }}
            {{ pool.tokenizer.symbol }}
          </div>
          <div class="d-flex">
            <div class="flex-auto">
              Pool type
            </div>
            {{ pool.strategy.name }}
            ({{ pool.strategy.type }})
          </div>
          <div v-if="pool.strategy.swapFee" class="d-flex">
            <div class="flex-auto">
              Swap fee
            </div>
            {{ $n(pool.strategy.swapFeePercent) }}%
          </div>
        </Block>
        <BlockPoolTokens
          :tokens="getTokens({ addresses: pool.tokens })"
          :tokenBalances="pool.tokenBalances"
          :tokenWeights="pool.strategy.weightsPercent || []"
        />
      </div>
    </template>
    <template slot="sidebar-right">
      <div v-if="pool && !loading && !registry.loading && pool.tokenizer">
        <BlockPoolActions
          @joinPool="onJoinPool"
          @exitPool="onExitPool"
          @approve="onApprove"
          :hasAllowed="hasAllowed"
          :tokens="getTokens()"
          :pool="pool"
        />
      </div>
    </template>
  </Layout>
</template>

<script>
import getProvider from '@/utils/provider';
import { parseUnits } from '@ethersproject/units';
import { mapActions, mapGetters } from 'vuex';
import { exitPool, getPool, joinPool } from '@/utils/balancer/utils/pools';
import { approveTokens } from '@/utils/balancer/utils/tokens';
import constants from '@/utils/balancer/constants';
import { getMarketChart } from '@/utils/coingecko';

export default {
  data() {
    return {
      id: this.$route.params.id,
      loading: false,
      pool: false,
      hasAllowed: false,
      marketCharts: [],
      marketChartsDays: 7,
      marketChartsLoading: false
    };
  },
  computed: {
    ...mapGetters(['getTokens'])
  },
  methods: {
    ...mapActions(['notify', 'injectTokens']),
    handleCopy() {
      this.notify('Copied!');
    },
    async loadPool() {
      this.pool = await getPool(
        this.web3.network.key,
        getProvider(this.web3.network.key),
        this.id
      );
    },
    async onApprove(data) {
      try {
        const tx = await approveTokens(
          this.$auth.web3,
          constants.vault,
          Object.keys(data)
        );
        console.log(tx);

        this.hasAllowed = true;
      } catch (e) {
        console.log(e);
      }
    },
    async onJoinPool(data) {
      this.tokens = this.getTokens();
      const [poolAmountOut] = data.receiveAmounts;
      const maxAmountsIn = this.pool.tokens.map((token, i) =>
        parseUnits(data.sendAmounts[i], this.tokens[token].decimals).toString()
      );
      const transferTokens = true;
      const beneficiary = this.web3.account;
      const params = [
        parseUnits(
          poolAmountOut,
          this.tokens[this.pool.tokenizer.address].decimals
        ),
        maxAmountsIn,
        transferTokens,
        beneficiary
      ];
      try {
        const tx = await joinPool(
          this.$auth.web3,
          this.pool.tokenizer.address,
          params
        );
        console.log(tx);
        await this.loadPool();
        this.notify('You did it!');
      } catch (e) {
        console.log(e);
      }
    },
    async onExitPool(data) {
      this.tokens = this.getTokens();
      const [poolAmountIn] = data.sendAmounts;
      const minAmountsOut = this.pool.tokens.map((token, i) =>
        parseUnits(
          data.receiveAmounts[i],
          this.tokens[token].decimals
        ).toString()
      );
      const withdrawTokens = true;
      const beneficiary = this.web3.account;
      const params = [
        parseUnits(
          poolAmountIn,
          this.tokens[this.pool.tokenizer.address].decimals
        ),
        minAmountsOut,
        withdrawTokens,
        beneficiary
      ];
      try {
        const tx = await exitPool(
          this.$auth.web3,
          this.pool.tokenizer.address,
          params
        );
        console.log(tx);
        await this.loadPool();
        this.notify('You did it!');
      } catch (e) {
        console.log(e);
      }
    },
    async addToken() {
      const tokens = this.getTokens();
      const address = this.pool.tokenizer.address;
      // @ts-ignore
      await this.$auth.provider.sendAsync({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol: tokens[address].symbol,
            decimals: tokens[address].decimals
          }
        },
        id: Math.round(Math.random() * 100000)
      });
    },
    async loadMarketCharts(days) {
      this.marketChartsLoading = true;
      this.marketChartsDays = days;
      this.marketCharts = await Promise.all([
        getMarketChart('0xba100000625a3754423978a60c9317c58a424e3D', days),
        getMarketChart('0x514910771AF9Ca656af840dff83E8264EcF986CA', days)
      ]);
      this.marketChartsLoading = false;
    }
  },
  async created() {
    this.loading = true;
    await this.loadPool();
    await this.injectTokens([...this.pool.tokens, this.pool.tokenizer.address]);
    await this.loadMarketCharts(7);
    this.loading = false;
  }
};
</script>
