<script lang="ts" setup>
import BigNumber from 'bignumber.js';
import { useRoute } from 'vue-router';

import Notifications from '@/components/notifications/Notifications.vue';
import ThirdPartyServicesModal from '@/components/web3/ThirdPartyServicesModal.vue';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useWeb3Watchers from '@/composables/watchers/useWeb3Watchers';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';

import GlobalModalContainer from './components/modals/GlobalModalContainer.vue';
import AppSidebar from './components/navs/AppNav/AppSidebar/AppSidebar.vue';
import SanctionedWalletModal from './components/web3/SanctionedWalletModal.vue';
import useBackgroundColor from './composables/useBackgroundColor';
import useGnosisSafeApp from './composables/useGnosisSafeApp';
import useNavigationGuards from './composables/useNavigationGuards';
import { useSidebar } from './composables/useSidebar';
import useExploitWatcher from './composables/watchers/useExploitWatcher';
import useGlobalQueryWatchers from './composables/watchers/useGlobalQueryWatchers';
import usePoolCreationWatcher from './composables/watchers/usePoolCreationWatcher';
import { useThirdPartyServices } from './composables/useThirdPartyServices';
import useAlerts, {
  Alert,
  AlertPriority,
  AlertType,
} from './composables/useAlerts';

// Dynamic import of layout components:
// it prevents the initial bundle from including all the layouts (and their unique dependencies)
// each route will only load the layout that it needs
const DefaultLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/DefaultLayout.vue')
);
const BlankLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/BlankLayout.vue')
);
const FocussedLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/FocussedLayout.vue')
);
const ContentLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/ContentLayout.vue')
);
const PoolLayout = defineAsyncComponent(
  () => import('@/pages/_layouts/PoolLayout.vue')
);

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

/**
 * STATE
 */
const layout = ref('DefaultLayout');

const Layouts = {
  BlankLayout: BlankLayout,
  ContentLayout: ContentLayout,
  DefaultLayout: DefaultLayout,
  FocussedLayout: FocussedLayout,
  PoolLayout: PoolLayout,
};
/**
 * COMPOSABLES
 */
useWeb3Watchers();
usePoolCreationWatcher();
useGlobalQueryWatchers();
useGnosisSafeApp();
useExploitWatcher();
useNavigationGuards();
const { isWalletSelectVisible, toggleWalletSelectModal, isBlocked } = useWeb3();
const route = useRoute();
const { newRouteHandler: updateBgColorFor } = useBackgroundColor();
const { sidebarOpen } = useSidebar();
const { addAlert } = useAlerts();
const { handleThirdPartyModalToggle, isThirdPartyServicesModalVisible } =
  useThirdPartyServices();

// OPTIONAL FEATURE ALERTS are enabled by featureAlertEnabled toggle
const featureAlert: Alert = {
  id: 'new-ui-alert',
  priority: AlertPriority.HIGH,
  label: 'Balancer has a new UI! ...', // Add the new feature alert text here and set featureAlertEnabled to true to activate it
  type: AlertType.FEATURE,
  rememberClose: false,
  actionLabel: 'Try zen',
  action: () => {
    window.location.href = 'https://balancer.fi';
  },
};
const featureAlertEnabled = true;
if (featureAlertEnabled) addAlert(featureAlert);

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
</script>

<template>
  <div id="modal" />
  <div id="app">
    <component :is="Layouts[layout]" />

    <WalletSelectModal
      :isVisible="isWalletSelectVisible"
      :onShowThirdParty="() => handleThirdPartyModalToggle(true)"
      @close="toggleWalletSelectModal"
    />
    <SanctionedWalletModal :isVisible="isBlocked" />
    <ThirdPartyServicesModal
      :isVisible="isThirdPartyServicesModalVisible"
      @close="handleThirdPartyModalToggle(false)"
    />
    <AppSidebar v-if="sidebarOpen" />
    <Notifications />
  </div>
  <GlobalModalContainer />
</template>
