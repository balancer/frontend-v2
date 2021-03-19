<template>
  <div>
    <Edito />
    <Container class="mt-6">
      <MainMenu />
      <h3 v-text="$t('investmentPools')" />
      <div class="flex mt-2">
        <BalBtn
          color="primary"
          size="sm"
          outline
          @click.prevent="modal.selectToken = true"
        >
          <span>Filter</span>
        </BalBtn>
        <div class="flex ml-4" v-if="!registry.loading">
          <BalChip
            v-for="(token, i) in form.tokens"
            class="mr-2"
            :key="token"
            size="md"
            color="gray"
            :closeable="true"
            @closed="removeToken(i)"
          >
            <Token
              :token="tokens[token]"
              :symbol="false"
              size="20"
              class="flex-auto"
            />
            <span class="ml-1">{{ tokens[token].symbol }}</span>
          </BalChip>
        </div>
      </div>
    </Container>
    <Container class="mt-2" :slim="true">
      <BalCard
        v-if="!loading && !registry.loading"
        class="overflow-hidden"
        noPad
      >
        <TablePools :pools="filteredPools" :tokens="tokens" />
      </BalCard>
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
import { getAddress } from '@ethersproject/address';
import { getPoolLiquidity } from '@/utils/balancer/price';
import { getPools } from '@/api/subgraph';
import { clone } from '@/utils';

export default {
  data() {
    return {
      q: '',
      loading: false,
      poolData: [],
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
    'web3.config.key': function() {
      this.poolData = [];
      this.loadPools();
    },
    'form.tokens': function() {
      const query = clone(this.form);
      this.$router.push({ query });
    }
  },
  computed: {
    ...mapGetters(['getTokens', 'getTokenlists']),
    tokens() {
      return this.getTokens();
    },
    filteredPools() {
      return this.pools
        .filter(pool =>
          this.form.tokens.every(token => pool.tokens.includes(token))
        )
        .slice(0, this.limit);
    },
    pools() {
      const pools = this.poolData
        .map(pool => {
          const tokens = pool.tokensList.map(token => getAddress(token));
          const { id, weights } = pool;
          return {
            id,
            tokens,
            weights,
            liquidity: getPoolLiquidity(pool, this.market.prices),
            volume: 0,
            apy: 0
          };
        })
        .filter(pool => pool.tokens.every(address => !!this.tokens[address]));
      return pools;
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
      const chainId = this.web3.config.chainId;

      const poolData = await getPools(chainId);
      this.poolData = poolData;

      const tokens = poolData
        .map(pool => pool.tokens.map(token => getAddress(token.address)))
        .reduce((a, b) => [...a, ...b], []);
      await this.injectTokens(tokens);

      this.loading = false;
    }
  },
  async created() {
    await this.loadPools();
  }
};
</script>
