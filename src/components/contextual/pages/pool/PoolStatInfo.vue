<script setup lang="ts">
/**
 * TYPES
 */
type Props = {
  stats: {
    label: string;
    value: string;
  };
};

/**
 * PROPS
 */
defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
    <BalCard v-for="(stat, i) in stats" :key="i">
      <div class="text-sm text-gray-500 font-medium mb-2">
        <span class="truncate">{{ stat.label }}</span>
      </div>
      <div class="text-xl font-bold truncate flex items-center">
        {{ stat.value }}
      </div>
    </BalCard>
  </div>
</template>
