<script lang="ts">
import { defineComponent, onBeforeMount, watch, ref } from 'vue';
import { VueQueryDevTools } from 'vue-query/devtools';
import { useStore } from 'vuex';
import { useRoute, useRouter } from 'vue-router';
import BigNumber from 'bignumber.js';
import * as Layouts from '@/pages/_layouts';
import useWeb3Watchers from '@/composables/watchers/useWeb3Watchers';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import Notifications from '@/components/notifications/Notifications.vue';
import useGnosisSafeApp from './composables/useGnosisSafeApp';
import useGlobalQueryWatchers from './composables/watchers/useGlobalQueryWatchers';
import usePoolCreationWatcher from './composables/watchers/usePoolCreationWatcher';
import useAlerts, {
  Alert,
  AlertPriority,
  AlertType
} from './composables/useAlerts';
import { isMainnet } from './composables/useNetwork';
import { useI18n } from 'vue-i18n';

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
    usePoolCreationWatcher();
    useGlobalQueryWatchers();
    useGnosisSafeApp();
    const { isWalletSelectVisible, toggleWalletSelectModal } = useWeb3();
    const route = useRoute();
    const store = useStore();
    const router = useRouter();
    const { addAlert } = useAlerts();
    const { t } = useI18n();

    // Temporary feature alert for Balancer boosted pools.
    if (isMainnet) {
      const featureAlert: Alert = {
        id: 'boosted-pools',
        priority: AlertPriority.LOW,
        label: t('alerts.boostedPools'),
        type: AlertType.FEATURE,
        actionOnClick: true,
        action: () =>
          router.push({
            name: 'pool',
            params: {
              id:
                '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe'
            }
          })
      };
      addAlert(featureAlert);
    }

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
