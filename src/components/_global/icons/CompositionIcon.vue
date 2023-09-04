<script lang="ts" setup>
import useTailwind from '@/composables/useTailwind';

const { theme } = useTailwind();

const color = computed(() => theme.colors.white);
</script>

<template>
  <svg
    width="24"
    height="15"
    viewBox="0 0 24 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="7.5" cy="7.5" r="7" :stroke="color" />
    <circle cx="16.5" cy="7.5" r="7" :stroke="color" />
  </svg>
</template>
