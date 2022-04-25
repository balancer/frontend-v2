<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import AppHero from '@/components/heros/AppHero.vue';
import AppFooterNav from '@/components/navs/AppFooterNav/AppFooterNav.vue';
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * COMPOSABLES
 */
const route = useRoute();
const { upToLargeBreakpoint } = useBreakpoints();

/**
 * COMPUTED
 */
const isHomePage = computed(() => route.path === '/');
</script>

<template>
  <div>
    <AppNav />
    <AppHero v-if="isHomePage" />
    <div class="pb-16">
      <router-view :key="$route.path" />
    </div>
    <AppFooterNav v-if="upToLargeBreakpoint" />
    <BalBtn
      v-else
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
