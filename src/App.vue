<template>
  <div id="app" class="overflow-x-hidden lg:overflow-x-visible">
    <LoadingScreen v-if="appLoading || !appInit || web3Loading" />
    <UnsupportedNetworkScreen v-else-if="unsupportedNetwork" />
    <div v-else>
      <AppNav />
      <div class="pb-12">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
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
import LoadingScreen from '@/components/screens/LoadingScreen.vue';
import UnsupportedNetworkScreen from '@/components/screens/UnsupportedNetworkScreen.vue';
import AppNav from '@/components/navs/AppNav.vue';

export default defineComponent({
  components: {
    AppNav,
    AccountModal,
    LoadingScreen,
    UnsupportedNetworkScreen
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { loading: web3Loading, unsupportedNetwork } = useWeb3Watchers();

    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);
    const appInit = computed(() => store.state.app.init);
    const web3Modal = computed(() => store.state.web3.modal);

    // CALLBACKS
    onBeforeMount(() => {
      store.dispatch('app/init');
    });

    // METHODS
    const setAccountModal = val => store.commit('web3/setAccountModal', val);

    async function onLogin(connector: string): Promise<void> {
      setAccountModal(false);
      await store.dispatch('web3/login', connector);
    }

    return {
      appLoading,
      appInit,
      web3Modal,
      onLogin,
      web3Loading,
      unsupportedNetwork,
      setAccountModal
    };
  }
});
</script>
