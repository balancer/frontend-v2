<script  lang="ts">
export const isThirdPartyServicesModalVisible = ref(false);
</script>

<script setup lang="ts">
import BigNumber from 'bignumber.js';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import Notifications from '@/components/notifications/Notifications.vue';
import {
  DefaultLayout,
  BlankLayout,
  ContentLayout,
  FocusedLayout,
} from '@/pages/_layouts';
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

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

const Layouts = {
  DefaultLayout: DefaultLayout,
  BlankLayout: BlankLayout,
  ContentLayout: ContentLayout,
  FocusedLayout: FocusedLayout,
};

/**
 * STATE
 */
const layoutName = ref('DefaultLayout');
/**
 * COMPOSABLES
 */
const route = useRoute();
const store = useStore();
const { isWalletSelectVisible, toggleWalletSelectModal, isBlocked } = useWeb3();
const { newRouteHandler: updateBgColorFor } = useBackgroundColor();
const { sidebarOpen } = useSidebar();
onMounted(() => {
  useWeb3Watchers();
  usePoolCreationWatcher();
  useGlobalQueryWatchers();
  useGnosisSafeApp();
  useExploitWatcher();
  useNavigationGuards();
});

/**
 * CALLBACKS
 */
onBeforeMount(async () => {
  store.dispatch('app/init');
});

function handleThirdPartyModalToggle(value: boolean) {
  isThirdPartyServicesModalVisible.value = value;
}

/**
 * WATCHERS
 */
watch(route, newRoute => {
  updateBgColorFor(newRoute);
  if (newRoute.meta.layout) {
    layoutName.value = newRoute.meta.layout as string;
  } else {
    layoutName.value = 'DefaultLayout';
  }
});
</script>

<template>
  <div id="modal" />
  <div id="app">
    <component :is="Layouts[layoutName]" />

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

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}
</style>
