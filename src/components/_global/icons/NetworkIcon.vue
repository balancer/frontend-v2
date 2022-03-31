<script lang="ts" setup>
import { computed } from 'vue';

import useDarkMode from '@/composables/useDarkMode';
import useTailwind from '@/composables/useTailwind';

const { theme } = useTailwind();
const { darkMode } = useDarkMode();

const color = computed(() =>
  darkMode.value ? theme.colors.white : theme.colors.black
);
</script>

<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.99984 18.3333C14.6022 18.3333 18.3332 14.6023 18.3332 9.99996C18.3332 5.39759 14.6022 1.66663 9.99984 1.66663C5.39746 1.66663 1.6665 5.39759 1.6665 9.99996C1.6665 14.6023 5.39746 18.3333 9.99984 18.3333Z"
      :stroke="color"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M1.6665 10H18.3332"
      :stroke="color"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.99984 1.66663C12.0842 3.94859 13.2688 6.90999 13.3332 9.99996C13.2688 13.0899 12.0842 16.0513 9.99984 18.3333C7.91544 16.0513 6.73088 13.0899 6.6665 9.99996C6.73088 6.90999 7.91544 3.94859 9.99984 1.66663V1.66663Z"
      :stroke="color"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>
