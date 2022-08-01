<script setup lang="ts">
import { computed } from 'vue';

/**
 * TYPES
 */
type Props = {
  width: string | number;
  bufferWidth: string | number;
  size?: string;
  color?: string;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  size: '1',
  color: 'green',
});

/**
 * COMPUTED
 */
const barClasses = computed(() => ({
  [`h-${props.size}`]: true,
  [`bg-${props.color}-400`]: true,
}));

const bufferBarClasses = computed(() => ({
  [`h-${props.size}`]: true,
  [`bg-orange-500`]: true,
}));

const barStyles = computed(() => ({
  width: `${props.width}%`,
}));

const bufferBarStyles = computed(() => ({
  width: `${props.bufferWidth}%`,
}));
</script>

<template>
  <div class="progress-track">
    <div :class="['progress-bar', barClasses]" :style="barStyles" />
    <div
      v-if="props.bufferWidth != null && props.bufferWidth > 0"
      :class="['progress-bar', bufferBarClasses]"
      :style="bufferBarStyles"
    />
  </div>
</template>

<style scoped>
.progress-track {
  @apply w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden flex;
}

.progress-bar {
  transition: all 0.3s ease;
}
</style>
