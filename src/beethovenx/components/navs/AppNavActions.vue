<template>
  <div>
    <div v-if="account" class="flex items-center">
      <AppNavActivityBtn />
      <AppNavClaimBtn />
      <AppNavBeets />
      <AppNavAccountBtn />
    </div>
    <div v-else class="flex">
      <div class="mr-2">
        <AppNavBeets />
      </div>
      <BalBtn
        color="white"
        :size="upToLargeBreakpoint ? 'md' : 'sm'"
        @click="toggleWalletSelectModal"
        class="mr-2"
      >
        <WalletIcon class="mr-2" />
        <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
        <span class="lg:hidden" v-text="$t('connect')" />
      </BalBtn>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

import { EXTERNAL_LINKS } from '@/constants/links';

import useFathom from '@/composables/useFathom';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';

import useWeb3 from '@/services/web3/useWeb3';
import AppNavActivityBtn from '@/components/navs/AppNav/AppNavActivityBtn/AppNavActivityBtn.vue';
import AppNavAccountBtn from '@/components/navs/AppNav/AppNavAccountBtn.vue';
import AppNavClaimBtn from '@/beethovenx/components/navs/AppNavClaimBtn.vue';
import AppNavBeets from '@/beethovenx/components/navs/AppNavBeets.vue';

export default defineComponent({
  name: 'AppNavActions',

  components: {
    AppNavBeets,
    AppNavAccountBtn,
    AppNavClaimBtn,
    AppNavActivityBtn
  },

  setup() {
    // COMPOSABLES
    const { upToSmallBreakpoint, upToLargeBreakpoint } = useBreakpoints();
    const { fNum } = useNumbers();
    const { trackGoal, Goals } = useFathom();
    const {
      connectWallet,
      account,
      toggleWalletSelectModal,
      isMainnet,
      isKovan,
      isPolygon,
      isArbitrum
    } = useWeb3();

    // COMPUTED
    const liquidityMiningSupported = computed(
      () =>
        isMainnet.value || isPolygon.value || isArbitrum.value || isKovan.value
    );

    // METHODS
    function onClickConnect() {
      trackGoal(Goals.ClickNavConnectWallet);
    }

    return {
      // computed
      liquidityMiningSupported,
      account,
      upToSmallBreakpoint,
      upToLargeBreakpoint,
      // methods
      fNum,
      onClickConnect,
      connectWallet,
      toggleWalletSelectModal,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
