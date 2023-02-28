<script lang="ts" setup>
import { defineAsyncComponent } from 'vue';
// Async loading for bundle size
const VeBalRedirectModal = defineAsyncComponent(
  () => import('./VeBalRedirectModal.vue')
);
</script>

<template>
  <teleport to="#modal">
    <VeBalRedirectModal />
  </teleport>
</template>
