<template>
  <div>
    <div v-if="$auth.isAuthenticated.value" class="flex items-center">
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
      @click="onClickConnect"
    >
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <BalIcon name="log-out" size="sm" class="lg:hidden" />
    </BalBtn>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

import { EXTERNAL_LINKS } from '@/constants/links';

import useFathom from '@/composables/useFathom';
import useWeb3 from '@/composables/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';

import AppNavAccountBtn from './AppNavAccountBtn.vue';
import AppNavClaimBtn from './AppNavClaimBtn.vue';

export default defineComponent({
  name: 'AppNavActions',

  components: {
    AppNavAccountBtn,
    AppNavClaimBtn
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { bp } = useBreakpoints();
    const { account, profile, loading: web3Loading, isMainnet } = useWeb3();
    const { fNum } = useNumbers();
    const { trackGoal, Goals } = useFathom();

    // METHODS
    const setAccountModal = (isOpen: boolean) =>
      store.commit('web3/setAccountModal', isOpen);

    function onClickConnect() {
      setAccountModal(true);
      trackGoal(Goals.ClickNavConnectWallet);
    }

    return {
      // computed
      isMainnet,
      account,
      profile,
      web3Loading,
      bp,
      // methods
      setAccountModal,
      fNum,
      onClickConnect,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
