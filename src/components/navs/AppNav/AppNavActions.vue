<template>
  <div>
    <div v-if="account" class="flex items-center">
      <AppNavClaimBtn v-if="isMainnet" />
      <AppNavAccountBtn />
    </div>
    <BalBtn
      v-else
      color="gray"
      outline
      rounded
      :size="['xs', 'sm', 'md', 'lg'].includes(bp) ? 'md' : 'sm'"
      :circle="['xs', 'sm', 'md', 'lg'].includes(bp)"
      @click="toggleWalletSelectModal"
    >
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <BalIcon name="log-out" size="sm" class="lg:hidden" />
    </BalBtn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { EXTERNAL_LINKS } from '@/constants/links';

import useFathom from '@/composables/useFathom';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';

import AppNavAccountBtn from './AppNavAccountBtn.vue';
import AppNavClaimBtn from './AppNavClaimBtn.vue';
import useVueWeb3 from '@/services/web3/useVueWeb3';

export default defineComponent({
  name: 'AppNavActions',

  components: {
    AppNavAccountBtn,
    AppNavClaimBtn
  },

  setup() {
    // COMPOSABLES
    const { bp } = useBreakpoints();
    const { fNum } = useNumbers();
    const { trackGoal, Goals } = useFathom();
    const {
      connectWallet,
      account,
      toggleWalletSelectModal,
      isMainnet
    } = useVueWeb3();

    function onClickConnect() {
      trackGoal(Goals.ClickNavConnectWallet);
    }

    return {
      // computed
      isMainnet,
      account,
      bp,
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
