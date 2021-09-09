<script setup lang="ts">
import { computed } from 'vue';

/**
 * TYPES
 */
type Props = {
  width: string | number;
  size?: string;
  color?: string;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  size: '1',
  color: 'green'
});

/**
 * COMPUTED
 */
const barClasses = computed(() => ({
  [`h-${props.size}`]: true,
  [`bg-${props.color}-400`]: true
}));

const barStyles = computed(() => ({
  width: `${props.width}%`
}));
</script>

<template>
  <div class="progress-track">
    <div :class="['progress-bar', barClasses]" :style="barStyles" />
  </div>
</template>

<style>
.progress-track {
  @apply w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden;
}

.progress-bar {
  @apply rounded-full;
  transition: all 0.3s ease;
}
</style>
