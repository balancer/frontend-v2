<script lang="ts" setup>
import { useRoute } from 'vue-router';
import useWeb3 from '@/services/web3/useWeb3';
import DesktopLinkItem from './DesktopLinkItem.vue';
import useNetwork from '@/composables/useNetwork';
import { Goals, trackGoal } from '@/composables/useFathom';

const { isGoerli } = useWeb3();

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

<template></template>

<style scoped>
.desktop-links {
  @apply grid gap-6 grid-flow-col grid-rows-1 h-full content-center;
}
</style>
