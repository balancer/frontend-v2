<script lang="ts" setup>
import { computed } from 'vue';

import LogotypeBalancer from '@/components/icons/LogotypeBalancer.vue';

import AppIcon from './AppIcon.vue';
</script>

<template>
  <div class="flex items-center balancer-logotype sm:mr-4">
    <logotype-balancer />
  </div>
</template>

<style scoped>
.balancer-logotype :deep(.logotype) {
  @apply origin-top-left relative;
  transform: scale(1.1);
}
</style>
