<script lang="ts" setup>
import AppHero from '@/components/heros/AppHero.vue';
import { useContentLoadStates } from '@/composables/useContentLoadStates';
const HomePageHeroButtons = defineAsyncComponent(
  () => import('@/components/heros/HomePageHeroButtons.vue')
);

const { isGlobalProviderLoaded } = useContentLoadStates();

/**
 * COMPUTED
 */
// TODO: find a solution that does not depend on wallet state (as we want to load it in the first paint)
// const classes = computed(() => ({
//   ['h-64']: !isWalletReady.value && !isWalletConnecting.value,
//   ['h-44']: isWalletReady.value || isWalletConnecting.value,
// }));
</script>

<template>
  <AppHero class="h-64">
    <h1 class="headline" v-text="$t('defiLiquidityPools')" />
    <p class="mt-2 text-xl text-white" v-text="$t('builtOnBalancer')" />
    <HomePageHeroButtons v-if="isGlobalProviderLoaded" />
  </AppHero>
</template>

<style>
.headline {
  @apply text-white text-center text-4xl md:text-5xl pb-2 font-display font-normal;
}
</style>
