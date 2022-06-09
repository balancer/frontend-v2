<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import HomePageHero from '@/components/heros/HomePageHero.vue';
import PortfolioPageHero from '@/components/heros/PortfolioPageHero.vue';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import StakingProvider from '@/providers/local/staking/staking.provider';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { isDesktop } = useBreakpoints();

/**
 * COMPUTED
 */
const isHomePage = computed(() => route.name === 'home');
const isPortfolioPage = computed(() => route.name === 'portfolio');
</script>

<template>
  <div>
    <AppNav />
    <HomePageHero v-if="isHomePage" />
    <StakingProvider v-else-if="isPortfolioPage">
      <PortfolioPageHero :showInvestments="true" />
    </StakingProvider>

    <div class="pb-16">
      <router-view :key="$route.path" />
    </div>
    <BalBtn
      v-if="isDesktop"
      id="intercom-activator"
      circle
      size="lg"
      color="blue"
      class="fixed bottom-0 right-0 m-4 z-100"
    >
      <BalIcon name="message-square" size="lg" />
    </BalBtn>
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

#intercom-activator {
  z-index: 2147483004;
}
</style>
