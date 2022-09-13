<script setup lang="ts">
import { useReturnRoute } from '@/composables/useReturnRoute';

const { getReturnRoute } = useReturnRoute();
</script>
<template>
  <div class="pb-16">
    <div class="mb-12 layout-header">
      <div />
      <BalBtn tag="router-link" :to="getReturnRoute()" color="white" circle>
        <BalIcon name="x" size="lg" />
      </BalBtn>
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
