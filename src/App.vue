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
import useWeb3Watchers from '@/composables/useWeb3Watchers';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import AppHero from '@/components/heros/AppHero.vue';
import WalletSelectModal from '@/services/web3/components/WalletSelectModal.vue';
import useVueWeb3 from './services/web3/useVueWeb3';
import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import { useRoute } from 'vue-router';

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
    const web3Modal = computed(() => store.state.web3.modal);
    const isHomePage = computed(() => route.path === '/');

    // METHODS
    const setAccountModal = val => store.commit('web3/setAccountModal', val);

    const setBlockNumber = (blockNumber: number) =>
      store.commit('web3/setBlockNumber', blockNumber);

    async function onLogin(connector: string): Promise<void> {
      setAccountModal(false);
      await store.dispatch('web3/login', connector);
    }

    // CALLBACKS
    onBeforeMount(() => {
      store.dispatch('app/init');
      providerService.initBlockListener(setBlockNumber);
    });

    return {
      // computed
      web3Modal,
      isWalletSelectVisible,
      isHomePage,
      // methods
      onLogin,
      setAccountModal,
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
