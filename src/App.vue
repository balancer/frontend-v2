<template>
  <div id="app">
    <AppNav />
    <AppHero v-if="isHomePage" />
    <div class="pb-12">
      <router-view :key="$route.path" class="flex-auto" />
    </div>
    <div id="modal" />
    <AccountModal
      v-if="web3Modal"
      @close="setAccountModal(false)"
      @login="onLogin"
    />
    <VueQueryDevTools />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, computed } from 'vue';
import { VueQueryDevTools } from 'vue-query/devtools';
import { useStore } from 'vuex';
import useWeb3Watchers from '@/composables/useWeb3Watchers';
import AccountModal from '@/components/modals/AccountModal.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import AppHero from '@/components/heros/AppHero.vue';
import RpcProviderService from '@/services/rpc-provider/rpc-provider.service';
import { useRoute } from 'vue-router';

export default defineComponent({
  components: {
    AppNav,
    AppHero,
    AccountModal,
    VueQueryDevTools
  },

  setup() {
    // COMPOSABLES
    useWeb3Watchers();
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
      isHomePage,
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
