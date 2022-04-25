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
import { defineComponent } from 'vue';
import useBreakpoints from '@/composables/useBreakpoints';
import useWeb3 from '@/services/web3/useWeb3';
import AppNavActivityBtn from './AppNavActivityBtn/AppNavActivityBtn.vue';
import AppNavAccountBtn from './AppNavAccountBtn.vue';
import AppNavClaimBtn from './AppNavClaimBtn.vue';
import AppNavBeets from './AppNavBeets.vue';

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
    const { upToLargeBreakpoint } = useBreakpoints();
    const { connectWallet, account, toggleWalletSelectModal } = useWeb3();

    return {
      // computed
      account,
      upToLargeBreakpoint,
      // methods
      connectWallet,
      toggleWalletSelectModal
    };
  }
});
</script>
