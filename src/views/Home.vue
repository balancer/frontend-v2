<template>
  <div>
    <Edito />
    <Container class="mt-2">
      <h1>Investment pools</h1>
      <div
        class="width-full h-9 flex items-center cursor-pointer rounded border border-gray-500 hover:border-black hover:bg-gray-100"
        @click="modal.selectToken = true"
      >
        <span class="ml-2 text-gray-500">Name, symbol or contract address</span>
      </div>
      <div class="flex mt-3">
        <div class="flex mr-2" v-if="!registry.loading">
          <div
            v-for="(token, i) in form.tokens"
            :key="i"
            class="flex flex-items-center py-0.5 px-1 mr-2 rounded-full border border-gray-500"
          >
            <Token :token="tokens[token]" :symbol="false" class="flex-auto" />
            <span class="ml-1 text-black">{{ tokens[token].symbol }}</span>
            <a @click="removeToken(i)">
              <Icon name="close" size="12" class="ml-1" />
            </a>
          </div>
        </div>
      </div>
    </Container>
    <Container class="mt-2" :slim="true">
      <Block :slim="true" class="overflow-hidden">
        <div v-if="loading || registry.loading" class="text-center p-4">
          <UiLoading />
        </div>
        <TablePools v-else :pools="filteredPools" :tokens="tokens" />
      </Block>
    </Container>
    <teleport to="#modal">
      <ModalSelectToken
        :open="modal.selectToken"
        :loading="registry.loading"
        @close="modal.selectToken = false"
        @select="addToken"
        @selectTokenlist="modalSelectLists"
        @inputSearch="onTokenSearch"
        :tokens="getTokens({ q, not: form.tokens })"
        :tokenlists="getTokenlists({ active: true })"
      />
      <ModalSelectTokenlist
        :open="modal.selectTokenlist"
        @close="modal.selectTokenlist = false"
        @back="modalSelectToken"
        @select="toggleList($event)"
        @inputSearch="q = $event"
        :tokenlists="getTokenlists({ q })"
      />
    </teleport>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import getProvider from '@/utils/provider';
import { getPoolLiquidity } from '@/utils/balancer/price';
import { getNumberOfPools } from '@/utils/balancer/vault';
import { getPoolVolume } from '@/utils/balancer/subgraph';
import { getPools } from '@/utils/balancer/pools';
import { clone } from '@/utils';

export default {
  data() {
    return {
      q: '',
      loading: false,
      pools: [],
      limit: 64,
      form: {
        tokens: []
      },
      modal: {
        selectToken: false,
        selectTokenlist: false
      }
    };
  },
  watch: {
    'web3.network.key': function() {
      this.pools = [];
      this.loadPools();
    },
    'form.tokens': function() {
      const query = clone(this.form);
      this.$router.push({ query });
    }
  },
  computed: {
    ...mapGetters(['getTokens', 'getCurrentTokenlist', 'getTokenlists']),
    tokens() {
      return this.getTokens();
    },
    filteredPools() {
      return this.pools
        .filter(pool =>
          this.form.tokens.every(token => pool.tokens.includes(token))
        )
        .slice(0, this.limit);
    }
  },
  methods: {
    ...mapActions(['injectTokens', 'toggleList']),
    modalSelectToken() {
      this.modal.selectToken = true;
      this.modal.selectTokenlist = false;
      this.q = '';
    },
    modalSelectLists() {
      this.modal.selectToken = false;
      this.modal.selectTokenlist = true;
      this.q = '';
    },
    addToken(token) {
      this.form.tokens.push(token);
    },
    removeToken(i) {
      this.form.tokens = this.form.tokens.filter((token, index) => index !== i);
    },
    onTokenSearch(event) {
      this.q = event;
      this.injectTokens([event.trim()]);
    },
    loadMore() {
      this.limit += 8;
    },
    async loadPools() {
      const query = clone(this.$route.query);
      if (query.tokens && !Array.isArray(query.tokens))
        query.tokens = [query.tokens];
      this.form = { ...this.form, ...query };

      this.loading = true;
      const network = this.web3.network.key;
      const provider = getProvider(network);

      const totalPools = await getNumberOfPools(provider);
      console.log('Total pools', totalPools);

      if (totalPools > 0) {
        const poolVolume = await getPoolVolume(network);
        console.log('Pool volume', poolVolume);
        const poolIds = poolVolume.map(pool => pool.id);

        const pools = await getPools(network, provider, poolIds.slice(0, 20));
        console.log('Pools', pools);

        const poolData = pools.map((pool, i) => {
          const currentPoolVolume = parseFloat(poolVolume[i].totalSwapVolume);
          const pastPoolVolume =
            poolVolume[i].swaps.length === 0
              ? 0
              : parseFloat(poolVolume[i].swaps[0].totalSwapVolume);
          const volume = currentPoolVolume - pastPoolVolume;
          return {
            ...pool,
            liquidity: getPoolLiquidity(pool, this.tokens, this.market.prices),
            volume,
            apy: 0
          };
        });
        console.log('Pool data', poolData);

        const tokens = pools
          .map(pool => pool.tokens)
          .reduce((a, b) => [...a, ...b], []);
        await this.injectTokens(tokens);

        this.pools = poolData;
      }

      this.loading = false;
    }
  },
  async created() {
    await this.loadPools();
  }
};
</script>

<style scoped>
.column-sm {
  width: 120px;
}
</style>
