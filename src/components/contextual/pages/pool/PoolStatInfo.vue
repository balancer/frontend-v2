<script setup lang="ts">
type Props = {
  stats: {
    label: string;
    value: string;
  };
};

defineProps<Props>();
</script>

<template>
  <div class="flex mb-5">
    <BalCard v-for="(stat, i) in stats" :key="i" :class="{ 'ml-5': i > 0 }">
      <div class="text-sm text-gray-500 font-medium mb-2">
        <span>{{ stat.label }}</span>
      </div>
      <div class="text-xl font-bold truncate flex items-center">
        {{ stat.value }}
      </div>
    </BalCard>
  </div>
</template>
