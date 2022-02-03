<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();

function getReturnRoute() {
  const queryReturnRoute = route.query?.returnRoute as string;

  if (queryReturnRoute) {
    const queryReturnParams = route.query?.returnParams as string;

    if (queryReturnParams) {
      return { name: queryReturnRoute, params: JSON.parse(queryReturnParams) };
    }

    return { name: queryReturnRoute };
  }

  return { name: 'home' };
}
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
