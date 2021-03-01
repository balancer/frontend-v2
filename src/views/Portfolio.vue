<template>
  <Container :slim="true" class="mt-6">
    <MainMenu />
    <Block v-if="web3.account">
      <h2 v-text="$t('myInvestments')" class="mb-4" />
      <UiLoading v-if="!loaded" />
      <div v-else-if="pools.length > 0">
        <TablePortfolioPools :pools="pools" :tokens="tokens" />
        <div class="border-t mt-4">
          <a class="mt-8 max-w-sm text-base block">
            <div v-text="$t('investmentPoolsAbout')" class="mb-2" />
            <div v-text="$t('investmentPoolsAboutLink')" class="font-bold" />
          </a>
        </div>
      </div>
      <div v-else class="border-t mt-4">
        <router-link
          :to="{ name: 'home' }"
          class="mt-8 max-w-sm text-base block"
        >
          <div v-text="$t('emptyInvestmentPools')" class="mb-2" />
          <div v-text="$t('emptyInvestmentPoolsLink')" class="font-bold" />
        </router-link>
      </div>
    </Block>
    <BlockMyWallet v-if="web3.account" :loading="loading" />
  </Container>
</template>

<script>
import { mapGetters } from 'vuex';
import { getPoolsWithShares } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';

export default {
  data() {
    return {
      loaded: false,
      pools: []
    };
  },
  watch: {
    'web3.network.key': function() {
      this.load();
    },
    'web3.account': function() {
      this.load();
    }
  },
  computed: {
    ...mapGetters(['getTokens']),
    loading() {
      return (
        this.app.authLoading ||
        (this.account.loading && !this.account.loaded) ||
        this.registry.loading
      );
    },
    tokens() {
      return this.getTokens();
    }
  },
  methods: {
    async load() {
      const account = this.web3.account;
      if (account) {
        const network = this.web3.network.key;
        const provider = getProvider(network);
        this.pools = await getPoolsWithShares(network, provider, account);
        console.log('Pools', this.pools);
      }
      this.loaded = true;
    }
  },
  async created() {
    if (this.web3.account) {
      await this.load();
    }
  }
};
</script>
