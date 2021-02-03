<template>
  <div>
    <div class="text-center py-9 border-bottom block-bg mb-4">
      <h1 v-text="$t('explorePools')" class="mb-3" style="font-size: 44px;" />
      <UiButton
        class="px-3 hide-sm hide-md width-full"
        style="max-width: 380px;"
      >
        <Search class="width-full" />
      </UiButton>
    </div>
    <Layout>
      <template slot="sidebar-left">
        <BlockMenu />
        <Block :title="$t('filters')">
          <UiButton
            v-text="$t('tokensParen')"
            @click="modal.selectToken = true"
            class="mb-3 width-full"
          />
          <div v-if="!registry.loading">
            <div v-for="(token, i) in form.tokens" :key="i" class="d-flex py-1">
              <Token
                :token="tokens[token]"
                :symbol="true"
                class="text-white flex-auto"
              />
              <a @click="removeToken(i)">
                <Icon name="close" size="16" class="py-1 text-gray" />
              </a>
            </div>
          </div>
        </Block>
      </template>
      <template slot="content-right">
        <Block
          :slim="true"
          v-infinite-scroll="loadMore"
          infinite-scroll-distance="0"
          infinite-scroll-disabled="loading"
          class="overflow-hidden"
        >
          <div v-if="loading || registry.loading" class="text-center p-4">
            <UiLoading />
          </div>
          <div v-if="!registry.loading">
            <p
              v-if="!loading && Object.keys(filteredPools).length === 0"
              class="px-4 pt-4 pb-3"
            >
              {{ $t('errorNoMatch') }}
            </p>
            <div
              v-else
              v-for="pool in filteredPools"
              :key="pool.id"
              class="overflow-hidden border-bottom last-child-border-0"
            >
              <router-link
                :to="{ name: 'pool', params: { id: pool.id } }"
                class="d-block overflow-hidden"
              >
                <BlockPool :pool="pool" :tokens="tokens" />
              </router-link>
            </div>
          </div>
        </Block>
      </template>
      <portal to="modal">
        <ModalSelectToken
          :open="modal.selectToken"
          :loading="registry.loading"
          @close="modal.selectToken = false"
          @select="addToken"
          @selectTokenlist="modalSelectLists"
          @inputSearch="onTokenSearch"
          :tokens="getTokens({ q, not: form.tokens })"
          :tokenlist="getCurrentTokenlist"
        />
        <ModalSelectTokenlist
          :open="modal.selectTokenlist"
          @close="modal.selectTokenlist = false"
          @back="modalSelectToken"
          @select="toggleList($event)"
          @inputSearch="q = $event"
          :tokenlists="getTokenlists({ q })"
        />
      </portal>
    </Layout>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import getProvider from '@/utils/provider';
import Vault from '@/utils/balancer/vault';
import { getPools } from '@/utils/balancer/utils/pools';
import { clone } from '@/utils';

export default {
  data() {
    return {
      q: '',
      loading: false,
      pools: {},
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
      this.pools = {};
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
      return Object.fromEntries(
        Object.entries(this.pools)
          .filter(pool =>
            this.form.tokens.every(token => pool[1].tokens.includes(token))
          )
          .slice(0, this.limit)
      );
    }
  },
  methods: {
    ...mapActions(['injectTokens', 'setTokenlist', 'toggleList']),
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
      const vault = new Vault(
        this.web3.network.key,
        getProvider(this.web3.network.key)
      );
      const totalPools = await vault.getTotalPools();
      console.log('Total pools', totalPools);
      const poolIds = await vault.getPoolIds(0, totalPools);
      console.log('Pool ids', poolIds);
      const pools = await getPools(
        this.web3.network.key,
        getProvider(this.web3.network.key),
        poolIds.slice(0)
      );
      const tokens = [];
      Object.values(pools).forEach(pool =>
        pool.tokens.forEach(token => tokens.push(token))
      );
      await this.injectTokens(tokens);
      this.pools = pools;
      console.log('Multicall', this.pools);
      this.loading = false;
    }
  },
  async created() {
    await this.loadPools();
  }
};
</script>
