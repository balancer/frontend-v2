<template>
  <Block>
    <h2 v-text="$t('myWallet')" class="mb-4 mx-4 md:mx-0" />
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 md:col-span-6 text-base">
        <div class="border-t border-b md:border-l md:border-r">
          <div v-if="loading" class="text-center p-5">
            <UiLoading />
          </div>
          <div v-else>
            <div
              class="border-b py-3 px-4 flex font-semibold link-color font-bold text-lg"
            >
              <div v-text="$t('balance')" class="flex-auto" />
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
                  v-text="$tc('viewAllAssets', [tokensCount])"
                  class="text-color"
                />
                <a
                  v-if="limit === 1e2"
                  @click="limit = 3"
                  v-text="$t('viewLess')"
                  class="text-color"
                />
              </div>
              <a
                :href="_explorer(web3.network.key, web3.account)"
                target="_blank"
              >
                {{ $t('viewFullWallet') }}
                <Icon name="external-link" class="ml-1 text-color" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Block>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    loading: Boolean
  },
  data() {
    return {
      limit: 3
    };
  },
  computed: {
    ...mapGetters(['getTokens', 'getPortfolioValue', 'getEther']),
    tokens() {
      return this.getTokens();
    },
    ether() {
      return this.getEther();
    },
    portfolioValue() {
      return this.getPortfolioValue();
    },
    tokensWallet() {
      return this.getTokens({ withBalance: true, limit: this.limit });
    },
    tokensCount() {
      return Object.keys(this.getTokens({ withBalance: true })).length;
    }
  }
};
</script>
