<template>
  <component
    :is="tag"
    :class="['bal-btn', btnClasses]"
    :disabled="disabled || loading"
  >
    <div v-if="loading" class="flex justify-center items-center">
      <BalLoadingIcon :size="size" :color="iconColor" />
      <span v-if="loadingLabel" class="ml-2">
        {{ loadingLabel }}
      </span>
    </div>
    <div v-else class="content">
      <span v-if="label">
        {{ label }}
      </span>
      <slot v-else />
    </div>
  </component>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import BalLoadingIcon from '../BalLoadingIcon/BalLoadingIcon.vue';

export default defineComponent({
  name: 'BalBtn',

  components: {
    BalLoadingIcon,
  },

  props: {
    tag: {
      type: String,
      default: 'button',
      validator: (val: string): boolean =>
        ['button', 'a', 'div', 'router-link'].includes(val),
    },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean =>
        ['xs', 'sm', 'md', 'lg'].includes(val),
    },
    color: {
      type: String,
      default: 'primary',
      validator: (val: string): boolean =>
        [
          'primary',
          'gradient',
          'gradient-reverse',
          'gradient-pink-yellow',
          'gray',
          'red',
          'white',
          'blue',
        ].includes(val),
    },
    label: { type: String, default: '' },
    block: { type: Boolean, default: false },
    circle: { type: Boolean, default: false },
    outline: { type: Boolean, default: false },
    flat: { type: Boolean, default: false },
    rounded: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    loadingLabel: { type: String, default: 'loading...' },
    disabled: { type: Boolean, default: false },
  },

  setup(props) {
    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'xs':
          return 'px-2 h-6 text-xs';
        case 'sm':
          return 'px-3 h-9 text-base';
        case 'lg':
          return 'px-5 h-18 text-lg md:text-2xl';
        default:
          return 'px-4 h-12 text-base';
      }
    });

    const circleSizeClasses = computed(() => {
      switch (props.size) {
        case 'xs':
          return 'w-6 h-6 text-sm';
        case 'sm':
          return 'w-9 h-9 text-lg';
        case 'md':
          return 'w-12 h-12 text-lg';
        case 'lg':
          return 'w-16 h-16 text-2xl';
        default:
          return 'w-12 h-12 text-base';
      }
    });

    const bgGradientClasses = computed(() => {
      if (props.outline) return 'bg-transparent hover:bg-gray-50';

      let fromColor = 'blue';
      let toColor = 'pink';

      if (props.color === 'gradient-reverse') {
        fromColor = 'pink';
        toColor = 'blue';
      } else if (props.color === 'gradient-pink-yellow') {
        fromColor = 'pink';
        toColor = 'yellow';
      }

      if (props.disabled) {
        return `bg-gray-300 dark:bg-gray-700 text-white dark:text-gray-500`;
      }
      if (props.loading) {
        return `bg-gradient-to-tr from-${fromColor}-400 to-${toColor}-400`;
      }
      return `
        bg-gradient-to-tr from-${fromColor}-600 to-${toColor}-600
        hover:from-${fromColor}-700 hover:to-${toColor}-700 transition-colors
      `;
    });

    const bgFlatClasses = computed(() => {
      return `
        bg-${props.color}-50 hover:bg-${props.color}-100
        dark:bg-${props.color}-800 dark:hover:bg-${props.color}-700
      `;
    });

    const bgColorClasses = computed(() => {
      if (props.color.includes('gradient')) return bgGradientClasses.value;
      else if (props.outline) return 'bg-transparent';
      else if (props.flat) return bgFlatClasses.value;
      else if (props.color === 'white') {
        return 'bg-gray-50 hover:bg-white dark:bg-gray-800';
      } else {
        if (props.disabled) {
          return `bg-gray-300 dark:bg-gray-700 text-white dark:text-gray-500`;
        }
        if (props.loading) {
          return `bg-${props.color}-400 dark:bg-${props.color}-dark-400`;
        }

        return `
          bg-${props.color}-600 hover:bg-${props.color}-700
          dark:bg-${props.color}-gray-400 dark:hover:bg-${props.color}-gray-600
        `;
      }
    });

    const borderClasses = computed(() => {
      if (props.outline) {
        if (props.disabled)
          return `border border-gray-200 dark:border-gray-700`;
        return `border border-${props.color}-200 dark:border-${props.color}-700 dark:hover:border-${props.color}-600 dark:focus:border-${props.color}-600 hover:text-gray-600 dark:hover:text-gray-200 dark:focus:text-gray-200`;
      }
      return 'border-none';
    });

    const textColorClasses = computed(() => {
      if (props.outline && props.disabled)
        return 'text-gray-400 dark:text-gray-700';
      if (props.outline && props.color === 'gradient') return 'text-purple-700';
      if (props.color === 'white') {
        if (props.outline)
          return 'text-white hover:text-yellow-500 dark:hover:text-yellow-500';
        else return 'text-gray-800 hover:text-blue-600 dark:text-gray-100';
      }
      if (props.outline || props.flat)
        return `text-${props.color}-500 dark:text-${props.color}-400`;
      return 'text-white';
    });

    const displayClasses = computed(() => {
      if (props.circle) return 'flex justify-center items-center';
      if (props.block) return 'block w-full';
      return 'inline-block';
    });

    const shapeClasses = computed(() => {
      if (props.circle || props.rounded) return 'rounded-full';
      return 'rounded-lg';
    });

    const cursorClasses = computed(() => {
      if (props.disabled || props.loading) return 'cursor-not-allowed';
      return 'cursor-pointer';
    });

    const shadowClasses = computed(() => {
      if (props.flat || props.disabled || props.loading) return '';
      if (props.size === 'sm') return 'shadow hover:shadow-none';
      return 'shadow hover:shadow-none';
    });

    const btnClasses = computed(() => {
      return {
        [sizeClasses.value]: !props.circle,
        [circleSizeClasses.value]: props.circle,
        [bgColorClasses.value]: true,
        [textColorClasses.value]: true,
        [borderClasses.value]: true,
        [displayClasses.value]: true,
        [shapeClasses.value]: true,
        [shadowClasses.value]: true,
        [cursorClasses.value]: true,
      };
    });

    const iconColor = computed(() => {
      if (props.outline) return props.color;
      if (props.color === 'white') return 'gray';
      return 'white';
    });

    return {
      btnClasses,
      iconColor,
    };
  },
});
</script>

<style scoped>
.bal-btn {
  @apply overflow-hidden tracking-tight;

  font-variation-settings: 'wght' 500;
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
