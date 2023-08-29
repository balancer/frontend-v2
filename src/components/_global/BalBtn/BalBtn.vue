
<script setup lang="ts">
import BalLoadingIcon from '../BalLoadingIcon/BalLoadingIcon.vue';

import {
  hoverFrom,
  hoverTo,
  gradientFrom,
  gradientTo,
  loadingFrom,
  loadingTo,
  backgroundFlat,
  darkBackgroundFlat,
  darkHoverBackgroundFlat,
  hoverBackgroundFlat,
  hoverBackground,
  loadingBackground,
  loadingDarkBackground,
  background,
  darkHoverBackground,
  darkBackground,
  border,
  darkBorder,
  darkHoverBorder,
  text,
  darkText,
  darkFocusBorder,
} from 'button-options';

type Props = {
  tag?: 'button' | 'a' | 'div' | 'router-link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?:
    | 'primary'
    | 'gradient'
    | 'gradient-reverse'
    | 'gradient-pink-yellow'
    | 'gray'
    | 'red'
    | 'white'
    | 'blue'
    | 'yellow'
    | 'black'
    | 'transparent';
  label?: string;
  block?: boolean;
  circle?: boolean;
  outline?: boolean;
  flat?: boolean;
  rounded?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  justifyContent?: 'start' | 'center' | 'end' | 'between';
};

const props = withDefaults(defineProps<Props>(), {
  tag: 'button',
  size: 'md',
  color: 'primary',
  label: '',
  block: false,
  circle: false,
  outline: false,
  flat: false,
  rounded: false,
  loading: false,
  loadingLabel: 'loading...',
  disabled: false,
  justifyContent: 'center',
});

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
    return `bg-gradient-to-tr ${loadingFrom(fromColor)} ${loadingTo(toColor)}`;
  }
  return ` bg-gradient-to-tr ${gradientFrom(fromColor)} ${gradientTo(
    toColor
  )} ${hoverFrom(fromColor)} ${hoverTo(toColor)} transition-colors`;
});

const bgFlatClasses = computed(() => {
  return `
        ${backgroundFlat(props.color)} ${hoverBackgroundFlat(props.color)}
        ${darkBackgroundFlat(props.color)} ${darkHoverBackgroundFlat(
    props.color
  )}
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
      return `${loadingBackground(props.color)} ${loadingDarkBackground(
        props.color
      )}`;
    }

    return `
          ${background(props.color)} ${hoverBackground(props.color)}
          ${darkBackground(props.color)} ${darkHoverBackground(props.color)}
        `;
  }
});

const borderClasses = computed(() => {
  if (props.outline) {
    if (props.disabled) return `border border-gray-200 dark:border-gray-700`;
    return `border ${border(props.color)} ${darkBorder(
      props.color
    )} ${darkHoverBorder(props.color)} ${darkFocusBorder(
      props.color
    )} hover:text-gray-600 dark:hover:text-gray-200 dark:focus:text-gray-200`;
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
    return `${text(props.color)} ${darkText(props.color)}`;
  return 'text-white';
});

const displayClasses = computed(() => {
  if (props.circle) return 'flex justify-center items-center';
  if (props.block) return 'block w-full';
  return 'inline-block';
});

const contentClasses = computed(() => {
  if (!props.justifyContent) return 'justify-center';
  return `justify-${props.justifyContent}`;
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
</script>

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
    <div v-else :class="['content', contentClasses]">
      <span v-if="label">
        {{ label }}
      </span>
      <slot v-else />
    </div>
  </component>
</template>


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
  @apply flex items-center w-full h-full;
}
</style>
