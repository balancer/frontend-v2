<template>
  <Block>
    <h2 v-text="t('myWallet')" class="mb-4 mx-4 md:mx-0" />
    <div class="grid grid-cols-12 gap-5">
      <div class="col-span-12 md:col-span-6 text-base">
        <div class="border-t border-b md:border-l md:border-r">
          <div v-if="loading" class="text-center p-5">
            <BalLoadingIcon />
          </div>
          <div v-else>
            <div
              class="border-b py-3 px-4 flex font-semibold link-color font-bold text-lg"
            >
              <div v-text="t('balance')" class="flex-auto" />
              <div v-if="!loading && portfolioValue > 0">
                {{ fNum(portfolioValue, 'usd') }}
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
                  v-text="t('viewAllAssets', [tokensCount])"
                  class="text-color"
                />
                <a
                  v-if="limit === 1e2"
                  @click="limit = 3"
                  v-text="t('viewLess')"
                  class="text-color"
                />
              </div>
              <a :href="_explorer(networkKey, account)" target="_blank">
                {{ t('viewFullWallet') }}
                <Icon name="external-link" class="ml-1 text-color" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Block>
</template>

<script lang="ts">
import useNumbers from '@/composables/useNumbers';
import { computed, defineComponent, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

export default defineComponent({
  props: {
    loading: { type: Boolean, default: false }
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { t } = useI18n();
    const { fNum } = useNumbers();

    // DATA
    const limit = ref(3);

    // COMPUTED
    const account = computed(() => store.state.web3.account);
    const networkKey = computed(() => store.state.web3.config.key);
    const tokens = computed(() => getTokens());
    const ether = computed(() => store.getters['registry/getEther']());

    const portfolioValue = computed(() =>
      store.getters['account/getPortfolioValue']()
    );

    const tokensWallet = computed(() => {
      return getTokens({
        withBalance: true,
        limit: limit.value
      });
    });

    const tokensCount = computed(() => {
      return Object.keys(getTokens({ withBalance: true })).length;
    });

    // METHODS
    function getTokens(params = {}) {
      return store.getters['registry/getTokens'](params);
    }

    return {
      // data
      limit,
      // computed
      account,
      networkKey,
      tokens,
      ether,
      portfolioValue,
      tokensWallet,
      tokensCount,
      // methods
      t,
      fNum
    };
  }
});
</script>
