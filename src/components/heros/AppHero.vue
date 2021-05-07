<template>
  <div :class="['app-hero', classes]">
    <div class="w-full sm:w-3/4 md:w-1/2">
      <template v-if="isConnected">
        <h1
          v-text="$t('myInvestments')"
          class="text-lg font-normal text-white opacity-90 font-body mb-2"
        />
        <BalLoadingBlock
          v-if="isLoadingUserPools"
          class="h-10 w-40 mx-auto"
          white
        />
        <span v-else class="text-3xl font-bold text-white">
          {{ fNum(totalInvestedAmount, 'usd', { forcePreset: true }) }}
        </span>
      </template>
      <template v-else>
        <h1
          v-text="$t('ammPlatform')"
          class="text-white text-bold text-center"
        />
        <div class="flex justify-center mt-4">
          <BalBtn color="white" class="mr-4" @click="setAccountModal(true)">
            {{ $t('connectWallet') }}
          </BalBtn>
          <BalBtn
            tag="a"
            :href="EXTERNAL_LINKS.Balancer.Home"
            target="_blank"
            rel="noreferrer"
            color="white"
            outline
          >
            {{ $t('learnMore') }}
            <BalIcon name="external-link" size="sm" class="ml-2" />
          </BalBtn>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useStore } from 'vuex';

import useNumbers from '@/composables/useNumbers';
import useWeb3 from '@/composables/useWeb3';
import usePools from '@/composables/pools/usePools';

import { EXTERNAL_LINKS } from '@/constants/links';

export default defineComponent({
  name: 'AppHero',

  setup() {
    // COMPOSABLES
    const store = useStore();
    const { fNum } = useNumbers();
    const { isConnected } = useWeb3();
    const { totalInvestedAmount, isLoadingUserPools } = usePools();

    // COMPUTED
    const setAccountModal = (val: boolean) =>
      store.commit('web3/setAccountModal', val);

    const classes = computed(() => ({
      ['h-72']: !isConnected.value,
      ['h-40']: isConnected.value
    }));

    return {
      // data
      totalInvestedAmount,
      isLoadingUserPools,

      // computed
      isConnected,
      classes,

      // methods
      setAccountModal,
      fNum,
      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>

<style>
.app-hero {
  @apply bg-cover bg-center flex items-center justify-center text-center px-4;
  transition: all 0.3s ease-in-out;
  background-image: url('/images/backgrounds/bg-connect-wallet.svg');
}
</style>
