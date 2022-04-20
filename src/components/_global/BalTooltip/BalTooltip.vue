<script setup lang="ts">
import { createPopper, Instance as PopperInstance } from '@popperjs/core';
import { computed, onMounted, ref } from 'vue';

import BalIcon, { IconSize } from '../BalIcon/BalIcon.vue';

type Placement = 'top' | 'left' | 'bottom' | 'right';
type TextAlign = 'left' | 'center' | 'right' | '';

type Props = {
  text?: string;
  placement?: Placement;
  onShow?: () => void;
  onHide?: () => void;
  noPad?: boolean;
  disabled?: boolean;
  iconSize?: IconSize;
  iconName?: string;
  iconClass?: string;
  width?: string;
  textAlign?: TextAlign;
};

const props = withDefaults(defineProps<Props>(), {
  text: '',
  placement: 'top',
  noPad: false,
  disabled: false,
  width: '52',
  textAlign: '',
  iconName: 'info',
  iconSize: 'md',
  iconClass: 'text-gray-300'
});

const activator = ref<HTMLElement>();
const content = ref<HTMLElement>();
const popper = ref<PopperInstance>();

const tooltipClasses = computed(() => {
  return {
    [`w-${props.width}`]: true,
    [`text-${props.textAlign}`]: props.textAlign !== ''
  };
});

const tooltipPad = computed(() => {
  return {
    'p-3': !props.noPad
  };
});

// show the tooltip
const handleMouseEnter = () => {
  if (!props.disabled && content.value && popper.value) {
    content.value.setAttribute('data-show', '');
    popper.value.update();
    props.onShow && props.onShow();
  }
};

// hide the tooltip
const handleMouseLeave = () => {
  if (!props.disabled && content.value) {
    content.value.removeAttribute('data-show');
    props.onHide && props.onHide();
  }
};

onMounted(() => {
  if (activator.value && content.value) {
    popper.value = createPopper(activator.value, content.value, {
      placement: props.placement,
      modifiers: [{ name: 'offset', options: { offset: [0, 8] } }]
    });
  }
});
</script>
<template>
  <button
    ref="activator"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :class="['leading-none', { 'cursor-default': disabled }]"
    v-bind="$attrs"
  >
    <slot name="activator">
      <BalIcon :name="iconName" :size="iconSize" :class="iconClass" />
    </slot>
  </button>
  <div ref="content" class="tooltip" :class="tooltipClasses" v-bind="$attrs">
    <div :class="tooltipPad" class="tooltip-content">
      <p class="tooltip-text" v-if="text" v-text="text" />
      <slot v-else />
    </div>
  </div>
</template>
<style>
.tooltip {
  @apply z-50 hidden relative shadow-sm;
}

.dark .tooltip {
  @apply shadow-none;
}

/* Light mode gray shadow */

.tooltip:before {
  background-blend-mode: soft-light, soft-light, normal;
  background: radial-gradient(
    ellipse at center,
    rgba(0, 0, 0, 0.6),
    transparent
  );
  content: '';
  width: 100%;
  height: 100%;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  filter: blur(40px);
  z-index: -1;
  opacity: 0;
  animation: fadeIn 0.4s ease-out 0.05s both;
}

/* Dark mode radial gradient shadow */

.dark .tooltip:before {
  background-blend-mode: soft-light, soft-light, normal;
  background: radial-gradient(ellipse at left, yellow, transparent), 
    radial-gradient(ellipse at bottom right, blue, transparent),
    radial-gradient(ellipse at top, red, transparent);
  content: '';
}

.tooltip[data-show] {
  display: block;
}

.tooltip[data-popper-placement='top'] .tooltip-content {
  opacity: 0;
  animation: fadeInMoveUp 0.2s ease-out both;
}

.tooltip[data-popper-placement='bottom'] .tooltip-content {
  opacity: 0;
  animation: fadeInMoveDown 0.2s ease-out both;
}

.tooltip[data-popper-placement='top'] .tooltip-content:before {
  border-top: solid #fff 8px;
  border-left: solid transparent 8px;
  border-right: solid transparent 8px;
  bottom: -8px;
  content: ' ';
  height: 0;
  left: calc(50% - 7px);
  position: absolute;
  width: 0;
}

.dark .tooltip[data-popper-placement='top'] .tooltip-content:before {
  border-top: solid #0f172a 8px; /* gray-900 */
}

.tooltip-content {
  @apply rounded-md text-xs text-black dark:text-white bg-white dark:bg-gray-900 font-medium;
}

.tooltip-text {
  animation: fadeIn 0.5s ease-out 0.05s both;
}

.tooltip[data-popper-placement='bottom'] .tooltip-content:after {
  border-left: solid transparent 8px;
  border-right: solid transparent 8px;
  border-bottom: solid #fff 8px;
  top: -8px;
  content: ' ';
  height: 0;
  left: calc(50% - 7px);
  position: absolute;
  width: 0;
}

.dark .tooltip[data-popper-placement='bottom'] .tooltip-content:after {
  border-bottom: solid #0f172a 8px; /* gray-900 */
}
</style>
