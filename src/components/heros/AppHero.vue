<template>
  <div :class="['app-hero', classes]">
    <div class="w-full max-w-2xl mx-auto">
      <template v-if="isWalletReady">
        <h1
          v-text="$t('myInvestments')"
          class="text-base font-medium text-white opacity-90 font-body mb-2"
        />
        <BalLoadingBlock
          v-if="isLoadingUserPools"
          class="h-10 w-40 mx-auto"
          white
        />
        <span v-else class="text-3xl font-bold text-white">
          {{
            fNum2(totalInvestedAmount || '', {
              style: 'currency',
              fixedFormat: true
            })
          }}
        </span>
      </template>
      <template v-else>
        <h1
          v-text="$t('ammPlatform')"
          class="text-white text-center text-4xl md:text-5xl pb-2"
        />
        <div class="flex justify-center mt-4">
          <BalBtn
            :color="darkMode ? 'gray' : 'white'"
            class="mr-3"
            @click="onClickConnect"
          >
            {{ $t('connectWallet') }}
          </BalBtn>
          <BalBtn
            tag="a"
            :href="EXTERNAL_LINKS.Balancer.Home"
            target="_blank"
            rel="noreferrer"
            color="white"
            outline
            @click="trackGoal(Goals.ClickHeroLearnMore)"
          >
            {{ $t('learnMore') }}
            <BalIcon name="arrow-up-right" size="sm" class="ml-1" />
          </BalBtn>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import useNumbers from '@/composables/useNumbers';
import usePools from '@/composables/pools/usePools';

import { EXTERNAL_LINKS } from '@/constants/links';
import useFathom from '@/composables/useFathom';
import useWeb3 from '@/services/web3/useWeb3';
import useDarkMode from '@/composables/useDarkMode';

export default defineComponent({
  name: 'AppHero',

  setup() {
    // COMPOSABLES
    const { fNum2 } = useNumbers();
    const { isWalletReady, toggleWalletSelectModal } = useWeb3();
    const { trackGoal, Goals } = useFathom();
    const { totalInvestedAmount, isLoadingUserPools } = usePools();
    const { darkMode } = useDarkMode();

    const classes = computed(() => ({
      ['h-72']: !isWalletReady.value,
      ['h-40']: isWalletReady.value
    }));

    function onClickConnect() {
      toggleWalletSelectModal(true);
      trackGoal(Goals.ClickHeroConnectWallet);
    }

    return {
      // data
      totalInvestedAmount,
      isLoadingUserPools,
      Goals,

      // computed
      isWalletReady,
      classes,
      darkMode,

      // methods
      toggleWalletSelectModal,
      fNum2,
      onClickConnect,
      trackGoal,
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
  background-image: url('/images/backgrounds/bg-header.svg');
}
</style>
