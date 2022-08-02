<script lang="ts" setup>
import { computed } from 'vue';

import useDarkMode from '@/composables/useDarkMode';

/**
 * TYPES
 */
type RoundedOpts = 'sm' | 'md' | 'lg';

type Props = {
  white?: boolean;
  darker?: boolean;
  square?: boolean;
  rounded?: RoundedOpts;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  white: false,
  darker: false,
  square: false,
  rounded: 'lg',
});

/**
 * COMPOSABLES
 */
const { darkMode } = useDarkMode();

/**
 * COMPUTED
 */
const bgClass = computed(() => {
  if (props.white) return 'shimmer-white';
  if (darkMode.value) {
    return props.darker ? 'shimmer-dark-mode-darker' : 'shimmer-dark-mode';
  }
  return props.darker ? 'shimmer-light-mode-darker' : 'shimmer-light-mode';
});

const classes = computed(() => {
  return {
    [`rounded-${props.rounded}`]: !props.square,
    [bgClass.value]: true,
  };
});
</script>

<template>
  <div :class="['bal-loading-block', classes]" />
</template>

<style>
.bal-loading-block {
  min-height: 5px;
}

@keyframes shimmerBackground {
  0% {
    background-position: -5000px 0;
  }

  100% {
    background-position: 5000px 0;
  }
}

.shimmer-white {
  --start-color: rgb(255 255 255 / 10%);
  --mid-color: rgb(255 255 255 / 20%);
  --end-color: rgb(255 255 255 / 10%);

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--start-color) 4%,
    var(--mid-color) 25%,
    var(--end-color) 36%
  );
  background-size: 1000px 100%;
}

.shimmer-light-mode {
  --start-color: theme('colors.gray.50');
  --mid-color: theme('colors.gray.100');
  --end-color: theme('colors.gray.50');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--start-color) 4%,
    var(--mid-color) 25%,
    var(--end-color) 36%
  );
  background-size: 1000px 100%;
}

.shimmer-light-mode-darker {
  --start-color: theme('colors.gray.100');
  --mid-color: theme('colors.gray.200');
  --end-color: theme('colors.gray.100');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--start-color) 4%,
    var(--mid-color) 25%,
    var(--end-color) 36%
  );
  background-size: 1000px 100%;
}

.shimmer-dark-mode {
  --start-color: theme('colors.gray.850');
  --mid-color: theme('colors.gray.800');
  --end-color: theme('colors.gray.850');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--start-color) 4%,
    var(--mid-color) 25%,
    var(--end-color) 36%
  );
  background-size: 1000px 100%;
}

.shimmer-dark-mode-darker {
  --start-color: theme('colors.gray.700');
  --mid-color: theme('colors.gray.600');
  --end-color: theme('colors.gray.700');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--start-color) 4%,
    var(--mid-color) 25%,
    var(--end-color) 36%
  );
  background-size: 1000px 100%;
}
</style>
