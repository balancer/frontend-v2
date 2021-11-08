<script lang="ts">
import { defineComponent, onBeforeMount, watch, ref } from 'vue';
import { VueQueryDevTools } from 'vue-query/devtools';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import BigNumber from 'bignumber.js';
import * as Layouts from '@/components/layouts';
import useWeb3Watchers from '@/composables/watchers/useWeb3Watchers';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import Notifications from '@/components/notifications/Notifications.vue';
import useGnosisSafeApp from './composables/useGnosisSafeApp';
import useGlobalQueryWatchers from './composables/watchers/useGlobalQueryWatchers';

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

export default defineComponent({
  components: {
    ...Layouts,
    VueQueryDevTools,
    WalletSelectModal,
    Notifications
  },

  setup() {
    /**
     * STATE
     */
    const layout = ref('DefaultLayout');

    /**
     * COMPOSABLES
     */
    useWeb3Watchers();
    useGlobalQueryWatchers();
    useGnosisSafeApp();
    const { isWalletSelectVisible, toggleWalletSelectModal } = useWeb3();
    const route = useRoute();
    const store = useStore();

    /**
     * CALLBACKS
     */
    onBeforeMount(async () => {
      store.dispatch('app/init');
    });

    /**
     * WATCHERS
     */
    watch(route, newRoute => {
      if (newRoute.meta.layout) {
        layout.value = newRoute.meta.layout as string;
      } else {
        layout.value = 'DefaultLayout';
      }
    });

    return {
      // state
      layout,
      // computed
      isWalletSelectVisible,
      // methods
      toggleWalletSelectModal
    };
  }
});
</script>

<template>
  <div id="modal" />
  <div id="app">
    <component :is="layout" />
    <VueQueryDevTools />
    <WalletSelectModal
      :isVisible="isWalletSelectVisible"
      @close="toggleWalletSelectModal"
    />
    <Notifications />
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

#intercom-activator {
  z-index: 2147483004;
}
</style>
