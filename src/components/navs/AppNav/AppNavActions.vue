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
      @click="connectWallet('metamask')"
    >
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <BalIcon name="log-out" size="sm" class="lg:hidden" />
    </BalBtn>
  </div>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { useStore } from 'vuex';

import { EXTERNAL_LINKS } from '@/constants/links';

import useFathom from '@/composables/useFathom';
import useWeb3 from '@/composables/useWeb3';
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
    const store = useStore();
    const { bp } = useBreakpoints();
    const { profile, loading: web3Loading } = useWeb3();
    const { fNum } = useNumbers();
    const { trackGoal, Goals } = useFathom();
    const { connectWallet, account } = useVueWeb3();

    watch(account, () => console.log('app nav actions', account));

    // METHODS
    const setAccountModal = (isOpen: boolean) =>
      store.commit('web3/setAccountModal', isOpen);

    function onClickConnect() {
      setAccountModal(true);
      trackGoal(Goals.ClickNavConnectWallet);
    }

    return {
      // computed
      account,
      profile,
      web3Loading,
      bp,
      // methods
      setAccountModal,
      fNum,
      onClickConnect,
      connectWallet,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
