<template>
  <Layout class="mt-4">
    <template v-if="web3.account" v-slot:content-right>
      <div class="px-4 md:px-0">
        <Breadcrumb />
        <h1 class="mb-3">
          {{ $t('portfolio') }}
          <h2 v-if="!loading && portfolioValue > 0" class="float-right mt-1">
            {{ _num(portfolioValue, '$0,0')
            }}<span v-text="_num(portfolioValue, '.[00]')" class="text-gray" />
          </h2>
        </h1>
      </div>
      <Block :slim="true">
        <div v-if="loading" class="text-center p-4">
          <UiLoading />
        </div>
        <div v-else>
          <div class="p-3 border-b last-child-border-0 flex items-center">
            <Token :token="ether" :size="32" class="mr-3" />
            <div class="flex-auto">
              <div v-text="ether.name" class="link-color" />
              <div>
                {{ _num(ether.balance, '0,0.[000]') }}
                {{ ether.symbol }} · {{ _num(ether.price, '$0,0.[00]') }}
              </div>
            </div>
            <div class="text-right">
              <div class="link-color">
                {{ _num(ether.value, '$0,0.[00]') }}
              </div>
              <div>
                <span
                  v-if="ether.price24HChange"
                  :class="
                    ether.price24HChange > 0 ? 'text-green-500' : 'text-red-500'
                  "
                >
                  {{ _num(ether.price24HChange, '+0,0.[00]') }}% ({{
                    _num(ether.value24HChange, '$0,0.[00]')
                  }})
                </span>
              </div>
            </div>
          </div>
          <div
            v-for="(token, i) in getTokens({ withBalance: true })"
            :key="i"
            class="p-3 border-b last-child-border-0 flex items-center"
          >
            <Token :token="token" :size="32" class="mr-3" />
            <div class="flex-auto">
              <div v-text="token.name" class="link-color" />
              <div>
                {{ _num(token.balance, '0,0.[000]') }} {{ token.symbol }} ·
                {{ _num(token.price, '$0,0.[00]') }}
              </div>
            </div>
            <div class="text-right">
              <div class="link-color">
                {{ _num(token.value, '$0,0.[00]') }}
              </div>
              <div>
                <span
                  v-if="token.price24HChange"
                  :class="
                    token.price24HChange > 0 ? 'text-green-500' : 'text-red-500'
                  "
                >
                  {{ _num(token.price24HChange, '+0,0.[00]') }}% ({{
                    _num(token.value24HChange, '$0,0.[00]')
                  }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </Block>
    </template>
    <template v-slot:sidebar-left>
      <BlockMenu />
    </template>
  </Layout>
</template>

<script>
import { mapGetters } from 'vuex';
import { getPoolShares } from '@/utils/balancer/subgraph';

export default {
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
    }
  },
  async created() {
    const network = this.web3.network.key;
    const address = this.web3.account;
    const poolShares = await getPoolShares(network, address);
    console.log('Pool shares', poolShares);
  }
};
</script>
