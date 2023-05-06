<script lang="ts" setup>
import useFathom from '@/composables/useFathom';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';

import HeroConnectWalletButton from './HeroConnectWalletButton.vue';

/**
 * COMPOSABLES
 */
const { isWalletReady, isWalletConnecting } = useWeb3();
const { trackGoal, Goals } = useFathom();
</script>

<template >
  <div
    v-if="!isWalletReady && !isWalletConnecting"
    class="flex justify-center mt-6"
  >
    <HeroConnectWalletButton class="mr-4" />

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

