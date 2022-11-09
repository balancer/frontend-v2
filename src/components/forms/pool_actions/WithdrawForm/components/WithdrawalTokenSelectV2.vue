<script setup lang="ts">
import { Pool } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * Props
 */
const props = defineProps<Props>();
</script>

<template>
  <div class="group token-select-input selected">
    <div>
      <BalAsset :address="props.pool.address" class="mr-2 shadow" />
    </div>
    <span class="text-base font-medium">
      <span>{{ props.pool.symbol }}</span>
    </span>
  </div>
</template>
  

<style scoped>
.token-select-input {
  @apply shadow rounded-lg flex items-center h-10 px-2 whitespace-nowrap;
  @apply text-sm;

  font-variation-settings: 'wght' 700;
}

.selected {
  @apply bg-gray-50 dark:bg-gray-700 text-black dark:text-white;
}
</style>
