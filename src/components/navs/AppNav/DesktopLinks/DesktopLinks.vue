<script lang="ts" setup>
import { useRoute } from 'vue-router';
import DesktopLinkItem from './DesktopLinkItem.vue';
import useNetwork, { isTestnet } from '@/composables/useNetwork';
import { Goals, trackGoal } from '@/composables/useFathom';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { networkSlug } = useNetwork();

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
      :to="{ name: 'claim', params: { networkSlug } }"
      :active="isActive('claim')"
      prefetch
      @click="trackGoal(Goals.ClickNavClaim)"
    >
      <div class="flex items-center">
        {{ $t('claim') }}
      </div>
    </DesktopLinkItem>
    <DesktopLinkItem
      v-if="isTestnet"
      :to="{ name: 'faucet', params: { networkSlug } }"
      :active="isActive('faucet')"
    >
      Faucet
    </DesktopLinkItem>
    <DesktopLinkItem
      :to="{ name: 'vebal', params: { networkSlug } }"
      :active="isActive('vebal')"
      prefetch
      @click="trackGoal(Goals.ClickNavVebal)"
    >
      veBAL
    </DesktopLinkItem>
  </div>
</template>

<style scoped>
.desktop-links {
  @apply grid gap-6 grid-flow-col grid-rows-1 h-full content-center;
}
</style>
