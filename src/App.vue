<template>
  <div id="app" class="overflow-x-hidden lg:overflow-x-visible">
    <LoadingScreen v-if="app.loading || !app.init || web3Loading" />
    <UnsupportedNetworkScreen v-else-if="unsupportedNetwork" />
    <div v-else>
      <Topnav />
      <div class="pb-12">
        <router-view :key="$route.path" class="flex-auto" />
      </div>
    </div>
    <div id="modal" />
    <AccountModal
      :open="web3.modal"
      @close="setAccountModal(false)"
      @login="onLogin"
    />
    <Notifications />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount } from 'vue';
import { useStore } from 'vuex';
import useWeb3Watchers from '@/composables/useWeb3Watchers';
import AccountModal from '@/components/modals/AccountModal.vue';
import LoadingScreen from '@/components/screens/LoadingScreen.vue';
import UnsupportedNetworkScreen from '@/components/screens/UnsupportedNetworkScreen.vue';

export default defineComponent({
  components: {
    AccountModal,
    LoadingScreen,
    UnsupportedNetworkScreen
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { loading: web3Loading, unsupportedNetwork } = useWeb3Watchers();

    // CALLBACKS
    onBeforeMount(() => {
      store.dispatch('init');
    });

    // METHODS
    async function onLogin(connector: string): Promise<void> {
      store.commit('setAccountModal', false);
      await store.dispatch('login', connector);
    }

    return {
      onLogin,
      web3Loading,
      unsupportedNetwork
    };
  }
});
</script>
