<template>
  <div>
    <div v-if="$auth.isAuthenticated.value" class="flex items-center">
      <BalBtn
        v-if="totalPending > 0"
        tag="a"
        :href="`https://claim.balancer.finance/#/${account}`"
        target="_blank"
        rel="noreferrer"
        color="gradient"
        rounded
        class="mr-2 text-base hidden md:block"
        size="sm"
      >
        ✨ {{ fNum(totalPending, 'token') }} BAL
      </BalBtn>
      <div class="relative">
        <BalBtn
          class="auth-btn text-base"
          :loading="web3Loading"
          :loading-label="
            ['sm', 'md', 'lg'].includes(bp) ? '' : 'Connecting...'
          "
          color="gray"
          outline
          rounded
          :size="['sm', 'md', 'lg'].includes(bp) ? 'md' : 'sm'"
          :circle="['sm', 'md', 'lg'].includes(bp)"
        >
          <Avatar :address="account" :profile="profile" size="20" />
          <span
            v-if="profile.name || profile.ens"
            v-text="profile.name || profile.ens"
            class="pl-2 hidden lg:inline-block"
          />
          <span
            v-else
            v-text="_shorten(account)"
            class="pl-2 hidden lg:inline-block"
          />
        </BalBtn>
        <SettingsPopover v-if="!web3Loading" class="popover" />
      </div>
    </div>
    <BalBtn
      v-else
      class="text-base"
      color="gray"
      outline
      rounded
      :size="['sm', 'md', 'lg'].includes(bp) ? 'md' : 'sm'"
      :circle="['sm', 'md', 'lg'].includes(bp)"
      @click="setAccountModal(true)"
    >
      <span class="hidden md:inline-block" v-text="$t('connectWallet')" />
      <BalIcon name="log-out" size="sm" class="md:hidden" />
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

interface ActionsData {
  pendingClaims: Claim[] | null;
  totalPending: number;
}

export default defineComponent({
  name: 'AppNavActions',

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { bp } = useBreakpoints();
    const { account, profile, loading: web3Loading, userNetwork } = useWeb3();
    const { fNum } = useNumbers();

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
      fNum
    };
  }
});
</script>

<style>
.auth-btn:hover ~ .popover {
  @apply visible opacity-100;
}
</style>
