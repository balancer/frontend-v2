<template>
  <div>
    <div v-if="account" class="flex items-center">
      <AppNavClaimBtn />
      <AppNavAccountBtn />
    </div>
    <BalBtn
      v-else
      class="text-base"
      color="gray"
      outline
      rounded
      :size="['sm', 'md', 'lg'].includes(bp) ? 'md' : 'sm'"
      :circle="['sm', 'md', 'lg'].includes(bp)"
      @click="toggleWalletSelectModal"
    >
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <BalIcon name="log-out" size="sm" class="lg:hidden" />
    </BalBtn>
  </div>
  <teleport to="#modal">
    <WalletSelectModal
      :isVisible="isWalletSelectVisible"
      @close="toggleWalletSelectModal"
    />
  </teleport>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

import { EXTERNAL_LINKS } from '@/constants/links';

import useFathom from '@/composables/useFathom';
import useWeb3 from '@/composables/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';

import AppNavAccountBtn from './AppNavAccountBtn.vue';
import AppNavClaimBtn from './AppNavClaimBtn.vue';
import WalletSelectModal from '@/services/web3/components/WalletSelectModal.vue';
import useVueWeb3 from '@/services/web3/useVueWeb3';

export default defineComponent({
  name: 'AppNavActions',

  components: {
    AppNavAccountBtn,
    AppNavClaimBtn,
    WalletSelectModal
  },

  setup() {
    // COMPOSABLES
    const { bp } = useBreakpoints();
    const { profile, loading: web3Loading } = useWeb3();
    const { fNum } = useNumbers();
    const { trackGoal, Goals } = useFathom();
    const { connectWallet, account } = useVueWeb3();
    const isWalletSelectVisible = ref(false);

    // if the account ref has changed, we know that
    // the user has successfully connected a wallet
    watch(account, () => {
      toggleWalletSelectModal(false);
    });

    // METHODS
    const toggleWalletSelectModal = (value: boolean) => {
      if (value !== undefined && typeof value === 'boolean') {
        isWalletSelectVisible.value = value;
        return;
      }
      isWalletSelectVisible.value = !isWalletSelectVisible.value;
    };

    function onClickConnect() {
      trackGoal(Goals.ClickNavConnectWallet);
    }

    return {
      // computed
      account,
      profile,
      web3Loading,
      bp,
      isWalletSelectVisible,
      // methods
      toggleWalletSelectModal,
      fNum,
      onClickConnect,
      connectWallet,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
