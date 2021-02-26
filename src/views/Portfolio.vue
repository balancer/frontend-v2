<template>
  <Container :slim="true" class="mt-6">
    <MainMenu />
    <Block v-if="web3.account">
      <h2 v-text="$t('myInvestments')" class="mb-3" />
      <div v-if="!loaded" class="text-center p-5">
        <UiLoading />
      </div>
      <div v-else-if="pools.length > 0">
        <div
          v-for="pool in pools"
          :key="pool.id"
          class="border-bottom last-child-border-0"
        >
          <router-link
            :to="{ name: 'pool', params: { id: pool.id } }"
            class="d-block overflow-hidden"
          >
            <BlockPool :pool="pool" :tokens="tokens" />
          </router-link>
        </div>
        <div class="border-t mt-4">
          <div class="mt-8 max-w-sm">
            <div v-text="$t('investmentPoolsAbout')" />
            <div v-text="$t('investmentPoolsAboutLink')" class="font-bold" />
          </div>
        </div>
      </div>
      <div v-else class="border-t mt-4">
        <div class="mt-8 max-w-sm">
          <div v-text="$t('emptyInvestmentPools')" />
          <div v-text="$t('emptyInvestmentPoolsLink')" class="font-bold" />
        </div>
      </div>
    </Block>
    <Block v-if="web3.account">
      <h2 v-text="$t('myWallet')" class="mb-3" />
      <div class="grid grid-cols-12 gap-5">
        <div class="col-span-12 md:col-span-6">
          <div class="border">
            <div v-if="loading" class="text-center p-5">
              <UiLoading />
            </div>
            <div v-else>
              <div
                class="border-b py-3 px-4 flex font-semibold link-color text-lg"
              >
                <div class="flex-auto">
                  Balance
                </div>
                <div v-if="!loading && portfolioValue > 0">
                  {{ _num(portfolioValue, '$0,0.[00]') }}
                </div>
              </div>
              <RowWallet :token="ether" />
              <RowWallet
                v-for="(token, i) in tokensWallet"
                :key="i"
                :token="token"
              />
              <div class="border-t py-3 px-4 flex">
                <div class="flex-auto">
                  <a
                    v-if="limit !== 1e2 && tokensCount > limit"
                    @click="limit = 1e2"
                    class="text-color"
                  >
                    View all assets ({{ tokensCount }})
                  </a>
                  <a v-if="limit === 1e2" @click="limit = 3" class="text-color">
                    View less
                  </a>
                </div>
                <a
                  :href="_explorer(web3.network.key, web3.account)"
                  target="_blank"
                >
                  View full wallet
                  <Icon name="external-link" class="ml-1 text-color" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Block>
  </Container>
</template>

<script>
import { mapGetters } from 'vuex';
import { getPoolShares } from '@/utils/balancer/subgraph';
import { getPools } from '@/utils/balancer/pools';
import getProvider from '@/utils/provider';

export default {
  data() {
    return {
      loaded: false,
      limit: 3,
      pools: []
    };
  },
  computed: {
    ...mapGetters(['getTokens', 'getPortfolioValue', 'getEther']),
    loading() {
      return (
        this.app.authLoading ||
        (this.account.loading && !this.account.loaded) ||
        this.registry.loading
      );
    },
    ether() {
      return this.getEther();
    },
    portfolioValue() {
      return this.getPortfolioValue();
    },
    tokens() {
      return this.getTokens();
    },
    tokensWallet() {
      return this.getTokens({ withBalance: true, limit: this.limit });
    },
    tokensCount() {
      return Object.keys(this.getTokens({ withBalance: true })).length;
    }
  },
  methods: {
    async load() {
      const network = this.web3.network.key;
      const account = this.web3.account;
      const provider = getProvider(network);
      if (account) {
        const poolShares = await getPoolShares(network, account);
        const pools = await getPools(
          network,
          provider,
          poolShares.map(poolShare => poolShare.poolId.id)
        );
        this.pools = pools;
        console.log('Pools', pools);
      }
      this.loaded = true;
    }
  },
  watch: {
    'web3.network.key': function() {
      this.load();
    },
    'web3.account': function() {
      this.load();
    }
  },
  async created() {
    if (this.web3.account) {
      await this.load();
    }
  }
};
</script>
