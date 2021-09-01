<template>
  <div id="modal" />
  <div id="app">
    <AppNav />
    <AppHero v-if="isHomePage" />
    <div class="pb-16">
      <router-view :key="$route.path" class="flex-auto" />
    </div>
    <AppFooterNav v-if="upToLargeBreakpoint" />
    <BalBtn
      v-else
      id="intercom-activator"
      circle
      size="lg"
      color="blue"
      class="fixed bottom-0 right-0 m-4 z-100"
    >
      <BalIcon name="message-square" size="lg" />
    </BalBtn>
    <VueQueryDevTools />
    <WalletSelectModal
      :isVisible="isWalletSelectVisible"
      @close="toggleWalletSelectModal"
    />
    <Notifications />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, computed, watch } from 'vue';
import { VueQueryDevTools } from 'vue-query/devtools';
import { useStore } from 'vuex';
import BigNumber from 'bignumber.js';
import { useRoute } from 'vue-router';
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';
import { useI18n } from 'vue-i18n';

import useDarkMode from './composables/useDarkMode';
import useWeb3Watchers from '@/composables/useWeb3Watchers';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import AppHero from '@/components/heros/AppHero.vue';
import AppFooterNav from '@/components/navs/AppFooterNav/AppFooterNav.vue';
import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
import useWeb3 from '@/services/web3/useWeb3';
import { DEFAULT_TOKEN_DECIMALS } from './constants/tokens';
import Notifications from '@/components/notifications/Notifications.vue';
import useBreakpoints from './composables/useBreakpoints';
import { tryPromiseWithTimeout } from './lib/utils/promise';
import useTokens from './composables/useTokens';
import useAlerts, { AlertPriority, AlertType } from './composables/useAlerts';

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

const isGnosisSafeApp = async (): Promise<boolean> => {
  // Can't be a Safe app if we're not running in an iframe
  if (window.self === window.top) return false;

  // Try to connect to the Gnosis UI by querying Safe info
  // If we get no response then we're not in a Safe app
  try {
    await tryPromiseWithTimeout(new SafeAppsSDK().safe.getInfo(), 1000);
    return true;
  } catch {
    return false;
  }
};

export default defineComponent({
  components: {
    AppNav,
    AppFooterNav,
    AppHero,
    VueQueryDevTools,
    WalletSelectModal,
    Notifications
  },

  setup() {
    // COMPOSABLES
    useWeb3Watchers();
    const {
      isWalletSelectVisible,
      connectWallet,
      toggleWalletSelectModal
    } = useWeb3();
    const { priceQueryError, refetchPrices } = useTokens();
    const store = useStore();
    const route = useRoute();
    const { upToLargeBreakpoint } = useBreakpoints();
    const { darkMode, toggleDarkMode } = useDarkMode();
    const { addAlert, removeAlert } = useAlerts();
    const { t } = useI18n();

    // COMPUTED
    const isHomePage = computed(() => route.path === '/');

    // CALLBACKS
    onBeforeMount(async () => {
      // If we're running as a Safe App we want to automatically
      // connect to the provided safe.
      if (await isGnosisSafeApp()) {
        await connectWallet('gnosis');
        // Disable darkmode by default
        if (darkMode) toggleDarkMode();
      }

      store.dispatch('app/init');
    });

    watch(priceQueryError, () => {
      if (priceQueryError.value) {
        addAlert({
          id: 'price-error',
          label: t('alerts.price-provider-down'),
          type: AlertType.ERROR,
          persistent: true,
          action: refetchPrices.value,
          actionLabel: t('alerts.retry-label'),
          priority: AlertPriority.MEDIUM
        });
      } else {
        removeAlert('price-error');
      }
    });

    return {
      // computed
      isWalletSelectVisible,
      isHomePage,
      upToLargeBreakpoint,
      // methods
      toggleWalletSelectModal
    };
  }
});
</script>
<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

#intercom-activator {
  z-index: 2147483004;
}
</style>
