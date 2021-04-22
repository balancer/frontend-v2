<template>
  <div id="app">
    <AppNav />
    <AppHero />
    <div class="pb-12">
      <router-view :key="$route.path" class="flex-auto" />
    </div>
    <div id="modal" />
    <AccountModal
      :open="web3Modal"
      @close="setAccountModal(false)"
      @login="onLogin"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, computed } from 'vue';
import { useStore } from 'vuex';
import useWeb3Watchers from '@/composables/useWeb3Watchers';
import AccountModal from '@/components/modals/AccountModal.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import AppHero from '@/components/heros/AppHero.vue';
import InfuraService from '@/services/infura/service';

export default defineComponent({
  components: {
    AppNav,
    AppHero,
    AccountModal
  },

  setup() {
    // COMPOSABLES
    useWeb3Watchers();
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
      // methods
      onLogin,
      setAccountModal
    };
  }
});
</script>
