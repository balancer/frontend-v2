<script lang="ts" setup>
import { useRoute } from 'vue-router';

import useWeb3 from '@/services/web3/useWeb3';

const { isGoerli } = useWeb3();

import DesktopLinkItem from './DesktopLinkItem.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();

/**
 * METHODS
 */
function isActive(page: string): boolean {
  if (route.name === page) return true;
  return false;
}
</script>

<template>
  <div class="desktop-links">
    <DesktopLinkItem
      :to="{ name: 'home', params: { networkSlug: 'ethereum' } }"
      :active="isActive('home')"
    >
      {{ $t('invest') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'trade', params: { networkSlug: 'ethereum' } }"
      :active="isActive('trade')"
    >
      {{ $t('trade') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      v-if="isGoerli"
      :to="{ name: 'faucet', params: { networkSlug: 'goerli' } }"
      :active="isActive('faucet')"
    >
      Faucet
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'portfolio', params: { networkSlug: 'ethereum' } }"
      :active="isActive('portfolio')"
    >
      {{ $t('portfolio') }}
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'vebal', params: { networkSlug: 'ethereum' } }"
      :active="isActive('vebal')"
    >
      veBAL
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'claim', params: { networkSlug: 'ethereum' } }"
      :active="isActive('claim')"
    >
      <div class="flex items-center">
        {{ $t('claim') }}
        <StarsIcon class="ml-0.5 w-3.5 h-5" />
      </div>
    </DesktopLinkItem>
  </div>
</template>

<style scoped>
.desktop-links {
  @apply grid gap-6 grid-flow-col grid-rows-1 h-full content-center;
}
</style>
