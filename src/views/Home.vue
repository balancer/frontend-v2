<template>
  <Container :slim="true" class="overflow-hidden">
    <div class="px-4 px-md-0">
      <h1 v-text="'Explore'" class="mb-4" />
      <p class="mb-4">
        <router-link :to="{ name: 'create' }" class="mr-2">
          Create pool
        </router-link>
        <router-link :to="{ name: 'vault' }" class="mr-2">
          Vault
        </router-link>
      </p>
    </div>
    <div
      v-infinite-scroll="loadMore"
      infinite-scroll-distance="0"
      infinite-scroll-disabled="loading"
      class="overflow-hidden"
    >
      <UiLoading v-if="loading || registry.loading" />
      <div v-if="!registry.loading">
        <div
          v-for="pool in filteredPools"
          :key="pool.id"
          class="overflow-hidden"
        >
          <router-link
            :to="{ name: 'pool', params: { id: pool.id } }"
            class="d-block overflow-hidden mr-3"
          >
            <BlockPool :pool="pool" :tokens="tokens" />
          </router-link>
        </div>
      </div>
    </div>
  </Container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import Vault from '@/utils/balancer/vault';
import { getPools } from '@/utils/balancer/utils/pools';

export default {
  data() {
    return {
      loading: false,
      pools: {},
      limit: 8
    };
  },
  computed: {
    ...mapGetters(['getTokens']),
    tokens() {
      return this.getTokens();
    },
    filteredPools() {
      return Object.fromEntries(
        Object.entries(this.pools).slice(0, this.limit)
      );
    }
  },
  methods: {
    ...mapActions(['injectTokens']),
    loadMore() {
      this.limit += 8;
    }
  },
  async created() {
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
};
</script>
