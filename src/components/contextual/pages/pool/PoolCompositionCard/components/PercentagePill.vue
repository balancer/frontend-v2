<script setup lang="ts">
import { computed } from 'vue';

type Props = {
  isActive?: boolean;
};
const props = withDefaults(defineProps<Props>(), { isActive: false });

const textColorClasses = computed(() =>
  props.isActive
    ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20'
    : 'text-secondary bg-gray-200 dark:bg-gray-800'
);
</script>
<template>
  <div class="flex p-1 text-sm rounded" :class="[textColorClasses]">
    <slot></slot>
  </div>
</template>