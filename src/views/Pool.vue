<template>
  <div class="container mx-auto mt-4 px-4 lg:px-0">
    <PoolNav class="mt-7 lg:mt-14 mb-8 lg:mb-12" />

    <div v-if="!loading" class="lg:mb-10">
      <h3 class="font-bold mb-2">
        {{ header }}
      </h3>
      <div class="text-sm">
        {{ poolType }} pool. LPs earn
        {{ _num(pool.strategy.swapFeePercent / 100, '0.00%') }} in fees.
      </div>
    </div>

    <div class="px-4">
      <div class="flex flex-wrap -mx-8">
        <div class="order-2 lg:order-1 w-full lg:w-2/3">
          <div class="px-4" v-if="!loading && !registry.loading">
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
import { getTokensHistoricalPrice } from '@/api/coingecko';
import { getUserPoolEvents, getPoolSnapshots } from '@/api/subgraph';
import PoolActionsCard from '@/components/cards/PoolActionsCard.vue';
import PoolBalancesCard from '@/components/cards/PoolBalancesCard.vue';

export default {
  components: {
    PoolActionsCard,
    PoolBalancesCard
  },

  data() {
    return {
      id: this.$route.params.id,
      loading: true,
      events: {
        swaps: [],
        joins: [],
        exits: []
      },
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

    async loadEvents() {
      const network = this.web3.config.key;
      const account = this.web3.account;
      if (account) {
        this.events = await getUserPoolEvents(network, this.id, account);
      }
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
    this.loadEvents();
    this.loadChartData(30);
    this.loading = false;
  }
};
</script>
