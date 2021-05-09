<template>
  <div>
    <div v-if="$auth.isAuthenticated.value" class="flex items-center">
      <BalBtn
        v-if="totalPending > 0"
        tag="a"
        :href="EXTERNAL_LINKS.Balancer.Claim(account)"
        target="_blank"
        rel="noreferrer"
        color="gradient"
        rounded
        class="mr-2 text-base hidden md:block"
        size="sm"
      >
        <StarsIcon class="mr-1" />{{ fNum(totalPending, 'token') }} BAL
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
import { defineComponent, reactive, toRefs, watch } from 'vue';
import { Claim } from '@/types';
import getProvider from '@/utils/provider';
import { getPendingClaims } from '@/utils/balancer/claim';
import useWeb3 from '@/composables/useWeb3';
import { useStore } from 'vuex';
import useBreakpoints from '@/composables/useBreakpoints';
import useNumbers from '@/composables/useNumbers';
import AppNavAccountBtn from './AppNavAccountBtn.vue';
import { EXTERNAL_LINKS } from '@/constants/links';
import useFathom from '@/composables/useFathom';

interface ActionsData {
  pendingClaims: Claim[] | null;
  totalPending: number;
}

export default defineComponent({
  name: 'AppNavActions',

  components: {
    AppNavAccountBtn
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { bp } = useBreakpoints();
    const { account, profile, loading: web3Loading, userNetwork } = useWeb3();
    const { fNum } = useNumbers();
    const { trackGoal, Goals } = useFathom();

    // DATA
    const data = reactive<ActionsData>({
      pendingClaims: null,
      totalPending: 0
    });

    // METHODS
    const setAccountModal = val => store.commit('web3/setAccountModal', val);

    async function getClaimsData() {
      const provider = getProvider(userNetwork.value.key);
      const pendingClaims = await getPendingClaims(
        userNetwork.value.key,
        provider,
        account.value
      );
      data.pendingClaims = pendingClaims;
      data.totalPending = pendingClaims
        .map(claim => parseFloat(claim.amount))
        .reduce((a, b) => a + b, 0);
    }

    function onClickConnect() {
      setAccountModal(true);
      trackGoal(Goals.ClickNavConnectWallet);
    }

    // WATCHERS
    watch(account, newAccount => {
      data.pendingClaims = null;
      data.totalPending = 0;
      if (newAccount) getClaimsData();
    });

    return {
      // data
      ...toRefs(data),
      // computed
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
