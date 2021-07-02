<template>
  <div id="modal" />
  <div id="app">
    <AppNav />
    <AppHero v-if="isHomePage" />
    <div class="pb-12">
      <router-view :key="$route.path" class="flex-auto" />
    </div>
    <VueQueryDevTools />
    <WalletSelectModal
      :isVisible="isWalletSelectVisible"
      @close="toggleWalletSelectModal"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, computed } from 'vue';
import { VueQueryDevTools } from 'vue-query/devtools';
import { useStore } from 'vuex';
import BigNumber from 'bignumber.js';
import { useRoute } from 'vue-router';

import useWeb3Watchers from '@/composables/useWeb3Watchers';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import AppHero from '@/components/heros/AppHero.vue';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import { DEFAULT_TOKEN_DECIMALS } from './constants/tokens';

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

export default defineComponent({
  components: {
    AppNav,
    AppHero,
    VueQueryDevTools,
    WalletSelectModal
  },

  setup() {
    // COMPOSABLES
    useWeb3Watchers();
    const { isWalletSelectVisible, toggleWalletSelectModal } = useVueWeb3();
    const store = useStore();
    const route = useRoute();

    // SERVICES
    const providerService = new RpcProviderService();

    // COMPUTED
    const isHomePage = computed(() => route.path === '/');

    // METHODS

    const setBlockNumber = (blockNumber: number) =>
      store.commit('web3/setBlockNumber', blockNumber);

    // CALLBACKS
    onBeforeMount(() => {
      store.dispatch('app/init');
      providerService.initBlockListener(setBlockNumber);
    });

    return {
      // computed
      isWalletSelectVisible,
      isHomePage,
      // methods
      toggleWalletSelectModal
    };
  }
});
</script>
<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}
</style>
