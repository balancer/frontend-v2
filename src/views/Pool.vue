<template>
  <div class="container mx-auto mt-4">
    <div class="pool-nav">
      <BalBtn
        tag="router-link"
        :to="{ name: 'home' }"
        color="gray"
        size="sm"
        flat
      >
        <BalIcon name="arrow-left" size="sm" />
        <span class="ml-2">Home</span>
      </BalBtn>
    </div>

    <h1 class="my-4 flex items-center">
      {{ $t('pool') }} {{ _shorten(id) }}
      <BalBtn
        v-clipboard:copy="id"
        v-clipboard:success="handleCopy"
        color="gray"
        size="sm"
        flat
        circle
        class="ml-2"
      >
        <BalIcon name="copy" size="xs" />
      </BalBtn>
    </h1>

    <div class="px-8 lg:px-4">
      <div class="flex flex-wrap -mx-8">
        <div class="order-2 lg:order-1 w-full lg:w-2/3 px-4">
          <div v-if="!loading && !registry.loading">
            <PoolChart
              :tokens="pool.tokens"
              :prices="prices"
              :snapshots="snapshots"
            />
            <BalCard :title="$t('overview')" class="mt-8">
              <div class="flex">
                <div v-text="$t('poolTokenName')" class="flex-auto" />
                {{ tokens[pool.address].name }}
                <a @click="addToken" class="ml-1 mb-n1 mr-n1">
                  <Icon name="plus" size="22" />
                </a>
              </div>
              <div class="flex">
                <div v-text="$t('totalSupply')" class="flex-auto" />
                {{
                  _num(_units(pool.totalSupply, tokens[pool.address].decimals))
                }}
                {{ tokens[pool.address].symbol }}
              </div>
              <div class="flex">
                <div v-text="$t('poolType')" class="flex-auto" />
                {{ $t(pool.strategy.name) }}
              </div>
              <div v-if="pool.strategy.swapFee" class="flex">
                <div v-text="$t('swapFee')" class="flex-auto" />
                {{ _num(pool.strategy.swapFeePercent) }}%
              </div>
            </BalCard>
            <BlockPoolTokens
              class="mt-8"
              :tokens="getTokens({ addresses: pool.tokens })"
              :tokenBalances="pool.tokenBalances"
              :tokenWeights="pool.weightsPercent || []"
            />
            <BalCard title="Activity" class="mt-8" noContentPad>
              <TableSwaps :swaps="swaps" />
            </BalCard>
          </div>
        </div>
        <div class="order-1 lg:order-2 w-full lg:w-1/3 px-4 mt-8 lg:mt-0">
          <PoolActionsCard
            v-if="pool && !loading && !registry.loading"
            class="sticky top-24"
            :pool="pool"
            @on-tx="reloadPool"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { getPoolSwaps, getPoolSnapshots } from '@/utils/balancer/subgraph';
import { getTokensHistoricalPrice } from '@/utils/coingecko';
import PoolActionsCard from '@/components/cards/PoolActionsCard.vue';

export default {
  components: {
    PoolActionsCard
  },

  data() {
    return {
      id: this.$route.params.id,
      loading: false,
      swaps: [],
      prices: {},
      snapshots: [],
      hasAllowed: false,
      marketCharts: [],
      marketChartsDays: 7,
      marketChartsLoading: false
    };
  },

  computed: {
    ...mapGetters(['getTokens']),

    pool() {
      return this.pools.current;
    },

    tokens() {
      return this.getTokens();
    }
  },

  methods: {
    ...mapActions([
      'notify',
      'injectTokens',
      'watchTx',
      'loadPool',
      'loadPrices',
      'getBalances'
    ]),

    async reloadPool() {
      await this.loadPool(this.id);
      await this.injectTokens([...this.pool.tokens, this.pool.address]);
    },

    handleCopy() {
      this.notify(this.$t('copied'));
    },

    async loadSwaps() {
      const network = this.web3.config.key;
      this.swaps = await getPoolSwaps(network, this.id);
    },

    async loadChartData(days) {
      const network = this.web3.config.key;
      const addresses = this.pool.tokens;
      this.prices = await getTokensHistoricalPrice(network, addresses, days);
      this.snapshots = await getPoolSnapshots(network, this.id, days);
    },

    async addToken() {
      const address = this.pool.address;
      // @ts-ignore
      await this.$auth.provider.value.sendAsync({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address,
            symbol: this.tokens[address].symbol.slice(0, 6),
            decimals: this.tokens[address].decimals
          }
        },
        id: Math.round(Math.random() * 100000)
      });
    }
  },

  async created() {
    this.loading = true;
    await this.loadPool(this.id);
    await this.injectTokens([...this.pool.tokens, this.pool.address]);
    await this.loadSwaps();
    await this.loadChartData(30);
    this.loading = false;
  }
};
</script>
