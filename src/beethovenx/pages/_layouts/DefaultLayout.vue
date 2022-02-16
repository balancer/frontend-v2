<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppNav from '@/beethovenx/components/navs/AppNav.vue';
import AppFooterNav from '@/components/navs/AppFooterNav/AppFooterNav.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppHeaderBg from '@/beethovenx/components/backgrounds/AppHeaderBg.vue';
import AppHero from '@/beethovenx/components/heroes/AppHero.vue';
import GlobalStats from '@/beethovenx/components/stats/GlobalStats.vue';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { upToXLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const isFarmsPage = computed(() => route.path === '/farm');
const isPortfolioPage = computed(() => route.path === '/my-portfolio');
const isInvestPage = computed(() => {
  return route.path === '/pools';
});
const isTradePage = computed(() => {
  return route.path === '/trade';
});
const showGlobalStats = computed(() => {
  return isInvestPage.value || isFarmsPage.value || isTradePage.value;
});
const isHomePage = computed(() => route.path === '/');
</script>

<template>
  <div>
    <AppNav />
    <AppHeaderBg />
    <!--    <div class="relative">
      <AppHero v-if="isInvestPage" />
    </div>-->
    <div class="pb-16 relative">
      <router-view :key="$route.path" />
    </div>
    <AppFooterNav v-if="upToXLargeBreakpoint" />
    <div class="flex flex-col items-center mb-12 xl:mb-0 relative">
      <img src="~@/beethovenx/assets/images/community-image.png" />
      <div class="absolute bottom-0 flex justify-center pb-6 ml-8">
        <a href="https://twitter.com/beethoven_x" class="mr-12">
          <img
            src="~@/beethovenx/assets/images/twitter-icon.png"
            width="40"
            class="mx-auto"
          />
        </a>
        <a href="https://beethovenxio.medium.com/" class="mr-12">
          <img
            src="~@/beethovenx/assets/images/medium-icon.png"
            width="40"
            class="mx-auto"
          />
        </a>
        <a href="https://discord.gg/jedS4zGk28" class="mr-12">
          <img
            src="~@/beethovenx/assets/images/discord-icon.png"
            width="40"
            class="mx-auto"
          />
        </a>
        <a href="https://docs.beethovenx.io/" class="mr-12">
          <img
            src="~@/beethovenx/assets/images/gitbook-logo.png"
            width="40"
            class="mx-auto"
          />
        </a>
        <a href="https://github.com/beethovenxfi">
          <img
            src="~@/beethovenx/assets/images/github-logo.png"
            width="40"
            class="mx-auto"
          />
        </a>
      </div>
    </div>
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
