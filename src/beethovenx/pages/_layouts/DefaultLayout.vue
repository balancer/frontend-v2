<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppNav from '@/beethovenx/components/navs/AppNav.vue';
import AppFooterNav from '@/components/navs/AppFooterNav/AppFooterNav.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import AppHeaderBg from '@/beethovenx/components/backgrounds/AppHeaderBg.vue';
import AppHero from '@/beethovenx/components/heroes/AppHero.vue';
import GlobalStats from '@/beethovenx/components/stats/GlobalStats.vue';
import { EXTERNAL_LINKS } from '@/constants/links';

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
    <div class="z-10 pb-16 relative">
      <router-view :key="$route.path" />
    </div>
    <AppFooterNav v-if="upToXLargeBreakpoint" />
    <div class="-top-14 xl:top-0 flex flex-col items-center relative">
      <img src="~@/beethovenx/assets/images/community-image.png" />
      <div class="absolute bottom-0 flex justify-center pb-4 xl:pb-6 xl:ml-8">
        <template
          v-for="(item, index) in EXTERNAL_LINKS.Beethoven.NavOtherItems"
          :key="index"
        >
          <BalLink :href="item.url" v-if="item.icon" external class="mr-12">
            <img
              :src="require(`@/beethovenx/assets/images/${item.icon}.png`)"
              width="40"
              class="mx-auto"
            />
          </BalLink>
        </template>
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
