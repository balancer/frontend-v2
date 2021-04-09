<template>
  <div>
    <Edito />
    <div class="container mx-auto">
      <MainMenu class="mt-6" />
      <TablePools
        v-if="!loading && !registry.loading"
        class="mt-2"
        :pools="pools"
      />
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';
import { getPools } from '@/api/subgraph';
import { clone } from '@/utils';

export default {
  data() {
    return {
      loading: false,
      pools: []
    };
  },

  watch: {
    'web3.config.key': function() {
      this.pools = [];
      this.loadPools();
    }
  },

  methods: {
    ...mapActions(['injectTokens']),

    async loadPools() {
      const query = clone(this.$route.query);
      if (query.tokens && !Array.isArray(query.tokens))
        query.tokens = [query.tokens];
      this.form = { ...this.form, ...query };
      this.loading = true;
      const chainId = this.web3.config.chainId;
      const pools = await getPools(chainId);
      this.pools = pools;
      const tokens = pools
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
