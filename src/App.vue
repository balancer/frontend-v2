<script lang="ts">
import BigNumber from 'bignumber.js';
import { defineComponent, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { VueQueryDevTools } from 'vue-query/devtools';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import Notifications from '@/components/notifications/Notifications.vue';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useWeb3Watchers from '@/composables/watchers/useWeb3Watchers';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import * as Layouts from '@/pages/_layouts';
import useWeb3 from '@/services/web3/useWeb3';

import GlobalModalContainer from './components/modals/GlobalModalContainer.vue';
import AppSidebar from './components/navs/AppNav/AppSidebar/AppSidebar.vue';
import useAlerts, {
  Alert,
  AlertPriority,
  AlertType
} from './composables/useAlerts';
import useBackgroundColor from './composables/useBackgroundColor';
import useGnosisSafeApp from './composables/useGnosisSafeApp';
import useNavigationGuards from './composables/useNavigationGuards';
import { isL2 } from './composables/useNetwork';
import { useSidebar } from './composables/useSidebar';
import useExploitWatcher from './composables/watchers/useExploitWatcher';
import useGlobalQueryWatchers from './composables/watchers/useGlobalQueryWatchers';
import usePoolCreationWatcher from './composables/watchers/usePoolCreationWatcher';

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

export default defineComponent({
  components: {
    ...Layouts,
    VueQueryDevTools,
    WalletSelectModal,
    Notifications,
    AppSidebar,
    GlobalModalContainer
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
    useExploitWatcher();
    useNavigationGuards();
    const {
      isWalletSelectVisible,
      toggleWalletSelectModal
      // isMainnet
    } = useWeb3();
    const route = useRoute();
    const store = useStore();
    const { addAlert } = useAlerts();
    const { t } = useI18n();
    const { newRouteHandler: updateBgColorFor } = useBackgroundColor();
    const { sidebarOpen } = useSidebar();

    // Temporary feature alert for Balancer boosted pools.
    // commented out until veBAL launch, then change details for veBAL alert
    // if (isMainnet.value) {
    //   const featureAlert: Alert = {
    //     id: 'boosted-pools',
    //     priority: AlertPriority.LOW,
    //     label: t('alerts.boostedPools'),
    //     type: AlertType.FEATURE,
    //     rememberClose: true,
    //     actionOnClick: true,
    //     action: () =>
    //       router.push({
    //         name: 'pool',
    //         params: {
    //           id:
    //             '0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe'
    //         },
    //         query: {
    //           utm_source: 'website',
    //           utm_medium: 'banner',
    //           utm_campaign: 'aaveboostedpools'
    //         }
    //       })
    //   };
    //   addAlert(featureAlert);
    // }

    // Temporary feature alert due to the decreased APRs on L2s
    // because of the 1 week gap from veBAL
    if (isL2.value) {
      const featureAlert: Alert = {
        id: 'vebal-gap',
        priority: AlertPriority.LOW,
        label: t('alerts.vebalL2'),
        type: AlertType.FEATURE,
        rememberClose: false,
        actionOnClick: false
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
      updateBgColorFor(newRoute);
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
      sidebarOpen,
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
    <AppSidebar v-if="sidebarOpen" />
  </div>
  <GlobalModalContainer />
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

#intercom-activator {
  z-index: 2147483004;
}
</style>
