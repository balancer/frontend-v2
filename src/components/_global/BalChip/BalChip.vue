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
import BalIcon from '../BalIcon/BalIcon.vue';
import { defineComponent, computed } from 'vue';

function useChipClasses(size: string, color: string) {
  const isGradient = color === 'gradient';

  const sizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-px text-xs';
      case 'lg':
        return 'p-2 text-base';
      default:
        return 'p-1 text-sm';
    }
  };

  const bgGradientClasses = (): string => {
    return 'text-white bg-gradient-to-tr from-blue-500 to-pink-500';
  };

  const bgColorClasses = (): string => {
    if (isGradient) return bgGradientClasses();
    if (color === 'white') return 'bg-white';
    return `bg-${color}-100`;
  };

  const outlineClasses = (): string => {
    return `border-gray-100 border shadow-lg`;
  };

  return computed(() => {
    return {
      [sizeClasses()]: true,
      [bgColorClasses()]: true,
      [outlineClasses()]: true
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
        return 'xxs';
      case 'lg':
        return 'sm';
      default:
        return 'xs';
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
      validator: (val: string): boolean =>
        ['gray', 'gradient', 'white'].includes(val)
    },
    outline: {
      type: Boolean,
      default: () => false
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
  @apply cursor-pointer ml-1;
}
</style>
