<script setup lang="ts">
import AppNav from '@/components/navs/AppNav/AppNav.vue';
import useBreakpoints from '@/composables/useBreakpoints';

/**
 * COMPOSABLES
 */
const { isDesktop } = useBreakpoints();
</script>

<template>
  <div>
    <AppNav />
    <div class="pb-16">
      <router-view :key="$route.path" />
    </div>
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}
</style>
