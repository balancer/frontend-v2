<script setup lang="ts">
import { computed } from 'vue';

type Props = {
  isActive?: boolean;
};
const props = withDefaults(defineProps<Props>(), { isActive: false });

const textColorClasses = computed(() =>
  props.isActive ? 'text-blue-600 dark:text-blue-400' : 'text-secondary'
);
</script>
<template>
  <div
    class="flex p-1 text-sm bg-blue-100 dark:bg-gray-700 rounded"
    :class="[textColorClasses]"
  >
    <slot></slot>
  </div>
</template>