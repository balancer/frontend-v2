<script lang="ts" setup>
import BigNumber from 'bignumber.js';
import { useRoute } from 'vue-router';

import Notifications from '@/components/notifications/Notifications.vue';
import ThirdPartyServicesModal from '@/components/web3/ThirdPartyServicesModal.vue';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useWeb3Watchers from '@/composables/watchers/useWeb3Watchers';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import {
  BlankLayout,
  ContentLayout,
  DefaultLayout,
  FocussedLayout,
  JoinExitLayout,
} from '@/pages/_layouts';
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
  JoinExitLayout: JoinExitLayout,
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
const { handleThirdPartyModalToggle, isThirdPartyServicesModalVisible } =
  useThirdPartyServices();

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
