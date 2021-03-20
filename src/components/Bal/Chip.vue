<template>
  <div :class="['bal-chip', classes]">
    <div class="content-container">
      <span v-if="label">
        {{ label }}
      </span>
      <slot v-else />
      <div v-if="closeable" @click="$emit('closed')">
        <BalIcon name="x" :size="iconSize" :class="['close', iconClasses]" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BalIcon from './Icon.vue';
import { defineComponent, computed } from 'vue';

function useChipClasses(size: string, color: string) {
  const isGradient = color === 'gradient';

  const sizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 h-6 text-xs';
      case 'lg':
        return 'px-4 h-10 text-base';
      default:
        return 'px-3 h-8 text-sm';
    }
  };

  const bgGradientClasses = (): string => {
    return 'text-white bg-gradient-to-tr from-gradient-blue-500 to-gradient-pink-500';
  };

  const bgColorClasses = (): string => {
    if (isGradient) return bgGradientClasses();
    return `bg-${color}-100`;
  };

  return computed(() => {
    return {
      [sizeClasses()]: true,
      [bgColorClasses()]: true
    };
  });
}

function useCloseIcon(size: string, color: string) {
  const isGradient = color === 'gradient';
  const colorClass = isGradient ? 'text-white' : `text-${color}-500`;

  const classes = computed(() => {
    return {
      [colorClass]: true
    };
  });

  const iconSize = computed(() => {
    switch (size) {
      case 'sm':
        return 'xs';
      case 'lg':
        return 'md';
      default:
        return 'sm';
    }
  });

  return { classes, iconSize };
}

export default defineComponent({
  name: 'BalChip',

  components: {
    BalIcon
  },

  emits: ['closed'],

  props: {
    label: { type: String, default: '' },
    closeable: { type: Boolean, default: false },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val)
    },
    color: {
      type: String,
      default: 'gray',
      validator: (val: string): boolean => ['gray', 'gradient'].includes(val)
    }
  },

  setup(props) {
    const classes = useChipClasses(props.size, props.color);
    const { classes: iconClasses, iconSize } = useCloseIcon(
      props.size,
      props.color
    );

    return { classes, iconClasses, iconSize };
  }
});
</script>

<style scoped>
.bal-chip {
  @apply inline-block whitespace-nowrap rounded-full;
}

.content-container {
  @apply flex items-center leading-none h-full;
}

.close {
  @apply cursor-pointer ml-2;
}
</style>
