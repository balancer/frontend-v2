<script lang="ts" setup>
import { useAppzi } from '@/composables/useAppzi';
import useDarkMode from '@/composables/useDarkMode';

const { darkMode } = useDarkMode();
const { openNpsModal } = useAppzi();
</script>

<template>
  <BalHStack
    class="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
    justify="between"
    align="center"
  >
    <BalHStack align="center" spacing="sm">
      <BalIcon name="thumbs-up" size="sm" />
      <span class="text-xs font-bold">How did we do?</span>
    </BalHStack>

    <BalBtn size="xs" :color="darkMode ? 'gray' : 'white'" @click="openNpsModal"
      >Give feedback</BalBtn
    >
  </BalHStack>
</template>
