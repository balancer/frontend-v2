<template>
  <div :class="['bal-loading-block', classes]" />
</template>

<script lang="ts">
import useDarkMode from '@/composables/useDarkMode';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BalLoadingBlock',

  props: {
    white: { type: Boolean, default: false },
    darker: { type: Boolean, default: false },
    rounded: {
      type: String,
      default: 'lg',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val)
    }
  },

  setup(props) {
    const { darkMode } = useDarkMode();

    const bgClass = computed(() => {
      if (props.white) return 'shimmer-white';
      if (darkMode.value) {
        return props.darker ? 'shimmer-dark-mode-darker' : 'shimmer-dark-mode';
      }
      return props.darker ? 'shimmer-light-mode-darker' : 'shimmer-light-mode';
    });

    const classes = computed(() => {
      return {
        [`rounded-${props.rounded}`]: true,
        [bgClass.value]: true
      };
    });

    return { classes };
  }
});
</script>

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
  --startColor: rgba(255, 255, 255, 0.1);
  --midColor: rgba(255, 255, 255, 0.2);
  --endColor: rgba(255, 255, 255, 0.1);

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--startColor) 4%,
    var(--midColor) 25%,
    var(--endColor) 36%
  );
  background-size: 1000px 100%;
}

.shimmer-light-mode {
  --startColor: theme('colors.gray.50');
  --midColor: theme('colors.gray.100');
  --endColor: theme('colors.gray.50');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--startColor) 4%,
    var(--midColor) 25%,
    var(--endColor) 36%
  );
  background-size: 1000px 100%;
}

.shimmer-light-mode-darker {
  --startColor: theme('colors.gray.100');
  --midColor: theme('colors.gray.200');
  --endColor: theme('colors.gray.100');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--startColor) 4%,
    var(--midColor) 25%,
    var(--endColor) 36%
  );
  background-size: 1000px 100%;
}

.shimmer-dark-mode {
  --startColor: theme('colors.gray.850');
  --midColor: theme('colors.gray.800');
  --endColor: theme('colors.gray.850');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--startColor) 4%,
    var(--midColor) 25%,
    var(--endColor) 36%
  );
  background-size: 1000px 100%;
}

.shimmer-dark-mode-darker {
  --startColor: theme('colors.gray.700');
  --midColor: theme('colors.gray.600');
  --endColor: theme('colors.gray.700');

  animation: shimmerBackground 10s infinite;
  background: linear-gradient(
    to right,
    var(--startColor) 4%,
    var(--midColor) 25%,
    var(--endColor) 36%
  );
  background-size: 1000px 100%;
}
</style>
