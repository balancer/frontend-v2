<template>
  <div class="container mx-auto mt-4">
    <div class="pool-nav border-b pb-2 mb-4">
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

      <BalBtn
        tag="router-link"
        :to="{ name: 'portfolio' }"
        color="gray"
        size="sm"
        flat
      >
        <span class="ml-2">My Portfolio</span>
      </BalBtn>
    </div>

    <div v-if="!loading" class="mb-10">
      <h3 class="font-bold mb-2">
        {{ header }}
      </h3>
      <div class="text-sm">
        {{ poolType }} pool. LPs earn
        {{ _num(pool.strategy.swapFeePercent / 100, '0.00%') }} in fees.
      </div>
    </div>

    <div class="px-8 lg:px-4">
      <div class="flex flex-wrap -mx-8">
        <div class="order-2 lg:order-1 w-full lg:w-2/3 px-4">
          <div v-if="!loading && !registry.loading">
            <PoolChart
              class="mb-10"
              :tokens="pool.tokens"
              :prices="prices"
              :snapshots="snapshots"
            />
            <div v-if="swaps.length > 0">
              <h5 class="mb-5">Transactions in this pool</h5>
              <TableSwaps :swaps="swaps" />
            </div>
          </div>
        </div>
        <div class="order-1 lg:order-2 w-full lg:w-1/3 px-4 mt-8 lg:mt-0">
          <PoolActionsCard
            v-if="pool && !loading && !registry.loading"
            class="sticky top-24"
            :pool="pool"
            @on-tx="fetchPool"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { getPoolSwaps, getPoolSnapshots } from '@/utils/balancer/subgraph';
import { getTokensHistoricalPrice } from '@/api/coingecko';
import PoolActionsCard from '@/components/cards/PoolActionsCard.vue';

export default {
  components: {
    PoolActionsCard
  },

  data() {
    return {
      id: this.$route.params.id,
      loading: true,
      swaps: [],
      prices: {},
      snapshots: []
    };
  },

  computed: {
    ...mapGetters(['getTokens']),
    header() {
      if (!this.pool) {
        return '';
      }
      return this.pool.tokens
        .map((address, index) => {
          const weight = this.pool.weightsPercent[index];
          const token = this.tokens[address];
          if (!token) {
            return '';
          }
          const symbol = token.symbol;
          return `${this._num(weight, '0.')} ${symbol}`;
        })
        .join(', ');
    },
    poolType() {
      const strategyName = this.pool.strategy.name;
      if (strategyName === 'weightedPool') {
        return 'Weighted';
      }
      if (strategyName === 'stablePool') {
        return 'Stable';
      }
      return '';
    },
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
      'loadPrices'
    ]),

    handleCopy() {
      this.notify(this.$t('copied'));
    },

    async fetchPool() {
      await this.loadPool(this.id);
      await this.injectTokens([...this.pool.tokens, this.pool.address]);
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
    await this.fetchPool();
    this.loadSwaps();
    this.loadChartData(30);
    this.loading = false;
  }
};
</script>
