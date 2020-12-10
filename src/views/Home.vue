<template>
  <Container :slim="true" class="overflow-hidden">
    <div class="px-4 px-md-0">
      <h1 v-text="'Explore'" class="mb-4" />
    </div>
    <div
      v-infinite-scroll="loadMore"
      infinite-scroll-distance="0"
      infinite-scroll-disabled="loading"
      class="overflow-hidden"
    >
      <UiLoading v-if="loading" />
      <div v-for="pool in filteredPools" :key="pool.id" class="overflow-hidden">
        <router-link
          :to="{ name: 'pool', params: { id: pool.id } }"
          class="d-block overflow-hidden mr-3"
        >
          <BlockPool :pool="pool" :tokens="tokens" />
        </router-link>
      </div>
    </div>
  </Container>
</template>

<script>
import { mapGetters } from 'vuex';
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
    ...mapGetters(['getTokensObj']),
    tokens() {
      return this.getTokensObj({});
    },
    filteredPools() {
      return Object.fromEntries(
        Object.entries(this.pools).slice(0, this.limit)
      );
    }
  },
  methods: {
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
    const poolIds = await vault.getPoolIds(0, totalPools);
    this.pools = await getPools(
      this.web3.network.key,
      getProvider(this.web3.network.key),
      poolIds
    );
    console.log('Multicall', this.pools);
    this.loading = false;
  }
};
</script>
