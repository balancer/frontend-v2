<template>
  <div :class="['spinner', sizeClasses]">
    <div :class="`double-bounce1 ${colorClasses}`" />
    <div :class="`double-bounce2 ${colorClasses}`" />
  </div>
</template>

<script>
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'BalLoadingIcon',

  props: {
    color: {
      type: String,
      default: 'gray',
      validator: value => ['gray', 'primary', 'white'].includes(value),
    },
    size: {
      type: String,
      default: 'md',
      validator: value => ['xs', 'sm', 'md', 'lg'].includes(value),
    },
  },

  setup(props) {
    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'lg':
          return 'lg';
        case 'sm':
          return 'sm';
        case 'xs':
          return 'xs';
        default:
          return 'md';
      }
    });

    const colorClasses = computed(() => {
      switch (props.color) {
        case 'white':
          return 'bg-white dark:bg-opacity-50';
        case 'gray':
          return 'bg-gray-400 dark:bg-gray-500';
        default:
          return `bg-${props.color}-500`;
      }
    });

    return {
      sizeClasses,
      colorClasses,
    };
  },
});
</script>

<style scoped>
.spinner {
  position: relative;
}

.xs {
  width: 12px;
  height: 12px;
}

.sm {
  width: 16px;
  height: 16px;
}

.md {
  width: 22px;
  height: 22px;
}

.lg {
  width: 32px;
  height: 32px;
}

.double-bounce1,
.double-bounce2 {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  animation: sk-bounce 2s infinite ease-in-out;
}

.double-bounce2 {
  animation-delay: -1s;
}

@keyframes sk-bounce {
  0%,
  100% {
    transform: scale(0);
  }

  50% {
    transform: scale(1);
  }
}
</style>
