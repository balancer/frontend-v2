<template>
  <div :class="['bal-loading-block', classes]" />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BalLoadingBlock',

  props: {
    white: { type: Boolean, default: false },
    square: { type: Boolean, default: false }
  },

  setup(props) {
    const bgClass = computed(() => {
      if (props.white) return 'shimmer-white';
      return 'shimmer';
    });

    const classes = computed(() => {
      return {
        ['rounded-lg']: !props.square,
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

.shimmer {
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
</style>
