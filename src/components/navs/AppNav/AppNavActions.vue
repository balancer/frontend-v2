<template>
  <div>
    <div v-if="$auth.isAuthenticated.value" class="flex items-center">
      <BalBtn
        v-if="availableToClaim != null"
        tag="a"
        :href="EXTERNAL_LINKS.Balancer.Claim(account)"
        target="_blank"
        rel="noreferrer"
        color="gradient"
        rounded
        class="mr-2 text-base hidden md:block"
        size="sm"
      >
        <StarsIcon class="mr-1" />{{ fNum(availableToClaim, 'token') }} BAL
      </BalBtn>
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
      @click="onClickConnect"
    >
      <span class="hidden lg:inline-block" v-text="$t('connectWallet')" />
      <BalIcon name="log-out" size="sm" class="lg:hidden" />
    </BalBtn>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

import { EXTERNAL_LINKS } from '@/constants/links';

import useFathom from '@/composables/useFathom';
import useWeb3 from '@/composables/useWeb3';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';
import useUserClaimsQuery from '@/composables/queries/useUserClaimsQuery';

import AppNavAccountBtn from './AppNavAccountBtn.vue';

export default defineComponent({
  name: 'AppNavActions',

  components: {
    AppNavAccountBtn
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { bp } = useBreakpoints();
    const { account, profile, loading: web3Loading } = useWeb3();
    const { fNum } = useNumbers();
    const { trackGoal, Goals } = useFathom();
    const userClaimsQuery = useUserClaimsQuery();

    // COMPUTED
    const availableToClaim = computed(() =>
      userClaimsQuery.isSuccess.value
        ? userClaimsQuery.data?.value?.availableToClaim
        : null
    );

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
      availableToClaim,
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
