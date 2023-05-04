<script lang="ts" setup>
import BigNumber from 'bignumber.js';
import Notifications from '@/components/notifications/Notifications.vue';
import ThirdPartyServicesModal from '@/components/web3/ThirdPartyServicesModal.vue';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useWeb3Watchers from '@/composables/watchers/useWeb3Watchers';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import useWeb3 from '@/services/web3/useWeb3';
import AppSidebar from './components/navs/AppNav/AppSidebar/AppSidebar.vue';
import SanctionedWalletModal from './components/web3/SanctionedWalletModal.vue';
import useGnosisSafeApp from './composables/useGnosisSafeApp';
import useNavigationGuards from './composables/useNavigationGuards';
import { useSidebar } from './composables/useSidebar';
import useExploitWatcher from './composables/watchers/useExploitWatcher';
import useGlobalQueryWatchers from './composables/watchers/useGlobalQueryWatchers';
import usePoolCreationWatcher from './composables/watchers/usePoolCreationWatcher';
import { useThirdPartyServices } from './composables/useThirdPartyServices';

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

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
const { sidebarOpen } = useSidebar();
const { handleThirdPartyModalToggle, isThirdPartyServicesModalVisible } =
  useThirdPartyServices();
</script>

<template>
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
</template>
