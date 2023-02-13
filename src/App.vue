<script lang="ts">
import BigNumber from 'bignumber.js';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

import Notifications from '@/components/notifications/Notifications.vue';
// import ThirdPartyServicesModal from '@/components/web3/ThirdPartyServicesModal.vue';
// import WalletSelectModal from '@/components/web3/WalletSelectModal.vue';
// import useWeb3Watchers from '@/composables/watchers/useWeb3Watchers';
import { DEFAULT_TOKEN_DECIMALS } from '@/constants/tokens';
import * as Layouts from '@/pages/_layouts';

import GlobalModalContainer from './components/modals/GlobalModalContainer.vue';
import AppSidebar from './components/navs/AppNav/AppSidebar/AppSidebar.vue';
import useBackgroundColor from './composables/useBackgroundColor';
import { useSidebar } from './composables/useSidebar';

BigNumber.config({ DECIMAL_PLACES: DEFAULT_TOKEN_DECIMALS });

export const isThirdPartyServicesModalVisible = ref(false);

export default defineComponent({
  components: {
    ...Layouts,
    // WalletSelectModal,
    // ThirdPartyServicesModal,
    Notifications,
    AppSidebar,
    GlobalModalContainer,
  },

  setup() {
    /**
     * STATE
     */
    const layout = ref('DefaultLayout');
    /**
     * COMPOSABLES
     */
    // useWeb3Watchers();
    // usePoolCreationWatcher();
    // useGlobalQueryWatchers();
    // useGnosisSafeApp();
    // useExploitWatcher();
    // useNavigationGuards();
    // const { isWalletSelectVisible, toggleWalletSelectModal, isBlocked } =
    //   useWeb3();
    const route = useRoute();
    const store = useStore();
    const { newRouteHandler: updateBgColorFor } = useBackgroundColor();
    const { sidebarOpen } = useSidebar();

    // ADD FEATURE ALERT HERE
    // const featureAlert: Alert = {
    //   id: 'vebal-gap',
    //   priority: AlertPriority.LOW,
    //   label: t('alerts.vebalL2'),
    //   type: AlertType.FEATURE,
    //   rememberClose: false,
    //   actionOnClick: false
    // };
    // addAlert(featureAlert);

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
      // isBlocked,
      isThirdPartyServicesModalVisible,
      // computed
      // isWalletSelectVisible,
      sidebarOpen,
      // methods
      // toggleWalletSelectModal,
    };
  },
});
</script>

<template>
  <div id="modal" />
  <div id="app">
    <component :is="layout" />
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
