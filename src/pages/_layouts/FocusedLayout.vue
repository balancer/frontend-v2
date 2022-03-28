<script setup lang="ts">
import { useReturnRoute } from '@/composables/useReturnRoute';

const { getReturnRoute } = useReturnRoute();
</script>
<template>
  <div class="pb-16">
    <div class="layout-header mb-12">
      <div></div>
      <router-link :to="getReturnRoute()">
        <BalIcon name="x" size="lg" />
      </router-link>
    </div>

    <router-view :key="$route.path" />
  </div>
</template>

<style scoped>
.layout-header {
  @apply h-16;
  @apply px-4 lg:px-6;
  @apply flex items-center justify-between;
}
</style>
