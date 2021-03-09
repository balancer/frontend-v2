<template>
  <component
    :is="tag"
    :class="['bal-btn', btnClasses]"
    :disabled="disabled || loading"
  >
    <div class="content">
      <div v-if="loading" class="flex items-center">
        <BalLoadingIcon :size="size" :color="iconColor" />
        <span v-if="loadingLabel" class="ml-2">
          {{ loadingLabel }}
        </span>
      </div>
      <div v-else>
        <span v-if="label">
          {{ label }}
        </span>
        <slot v-else />
      </div>
    </div>
  </component>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import BalLoadingIcon from './LoadingIcon.vue';

export default defineComponent({
  name: 'BalBtn',

  components: {
    BalLoadingIcon
  },

  props: {
    tag: {
      type: String,
      default: 'button',
      validator: (val: string): boolean => ['button', 'a', 'div'].includes(val)
    },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val)
    },
    color: {
      type: String,
      default: 'primary',
      validator: (val: string): boolean => ['primary', 'gradient'].includes(val)
    },
    label: { type: String, default: '' },
    block: { type: Boolean, default: false },
    circle: { type: Boolean, default: false },
    outline: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    loadingLabel: { type: String, default: 'loading...' },
    disabled: { type: Boolean, default: false }
  },

  setup(props) {
    const sizeClasses = (): string => {
      switch (props.size) {
        case 'sm':
          return 'px-4 h-8 text-xs';
        case 'lg':
          return 'px-2 md:px-12 h-16 text-lg md:text-2xl';
        default:
          return 'px-2 md:px-8 h-12 text-base';
      }
    };

    const circleSizeClasses = (): string => {
      switch (props.size) {
        case 'sm':
          return 'w-6 h-6 text-lg';
        case 'lg':
          return 'w-16 h-16 text-2xl';
        default:
          return 'w-10 h-10 text-base';
      }
    };

    const bgGradientClasses = (): string => {
      if (props.outline) return 'bg-transparent';

      if (props.disabled || props.loading) {
        return 'bg-gradient-to-tr from-gradient-blue-200 to-gradient-pink-200';
      }
      return `
        bg-gradient-to-tr from-gradient-blue-500 to-gradient-pink-500
        hover:from-gradient-blue-600 hover:to-gradient-pink-600
      `;
    };

    const bgColorClasses = (): string => {
      if (props.color === 'gradient') return bgGradientClasses();
      if (props.outline) return 'bg-transparent';

      if (props.disabled || props.loading) {
        return `bg-${props.color}-400 dark:bg-${props.color}-dark-400`;
      }

      return `
        bg-${props.color}-500 hover:bg-${props.color}-600
        dark:bg-${props.color}-dark-500 dark:hover:bg-${props.color}-dark-600
      `;
    };

    const borderClasses = (): string => {
      if (props.outline) return `border border-${props.color}-100`;
      return 'border-none';
    };

    const textColorClasses = (): string => {
      if (props.outline) return `text-${props.color}-100`;
      return 'text-white';
    };

    const displayClasses = (): string => {
      if (props.circle) return 'flex justify-center items-center';
      if (props.block) return 'block w-full';
      return 'inline-block';
    };

    const shapeClasses = (): string => {
      if (props.circle) return 'rounded-full';
      return 'rounded';
    };

    const cursorClasses = (): string => {
      if (props.disabled || props.loading) return 'cursor-not-allowed';
      return 'cursor-pointer';
    };

    const shadowClasses = (): string => {
      if (props.outline || props.disabled || props.loading) return '';
      return 'shadow-lg hover:shadow-none';
    };

    const btnClasses = computed(() => {
      return {
        [sizeClasses()]: !props.circle,
        [circleSizeClasses()]: props.circle,
        [bgColorClasses()]: true,
        [textColorClasses()]: true,
        [borderClasses()]: true,
        [displayClasses()]: true,
        [shapeClasses()]: true,
        [shadowClasses()]: true,
        [cursorClasses()]: true
      };
    });

    const iconColor = computed(() => {
      if (props.outline) return props.color;
      return 'white';
    });

    return {
      btnClasses,
      iconColor
    };
  }
});
</script>

<style scoped>
.bal-btn {
  @apply font-medium overflow-hidden;
  transition: all 0.2s ease;
  text-decoration: none !important;
  line-height: 0;
}

.bal-btn:focus,
.bal-btn:active {
  outline: none !important;
}

.content {
  @apply flex justify-center items-center w-full h-full;
}
</style>
