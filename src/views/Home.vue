<template>
  <Container :slim="true">
    <div class="px-4 px-md-0">
      <h1 v-text="'Explore'" class="mb-4" />
    </div>
    <div v-if="loading">
      <UiLoading />
    </div>
    <div v-else>
      <div v-for="pool in pools" :key="pool.id">
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
      pools: {}
    };
  },
  computed: {
    ...mapGetters(['getTokensObj']),
    tokens() {
      return this.getTokensObj({});
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
    this.loading = false;
    console.log('Multicall', this.pools);
  }
};
</script>
