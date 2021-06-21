<template>
  <div id="modal" />
  <div id="app">
    <AppNav />
    <AppHero />
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
import InfuraService from '@/services/infura/service';
import WalletSelectModal from '@/services/web3/components/WalletSelectModal.vue';
import useVueWeb3 from './services/web3/useVueWeb3';

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
    const { isWalletSelectVisible } = useVueWeb3();
    const store = useStore();

    // SERVICES
    const infuraService = new InfuraService();

    // COMPUTED
    const web3Modal = computed(() => store.state.web3.modal);

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
      infuraService.initBlockListener(setBlockNumber);
    });

    return {
      // computed
      web3Modal,
      isWalletSelectVisible,
      // methods
      onLogin,
      setAccountModal
    };
  }
});
</script>
<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}
</style>
