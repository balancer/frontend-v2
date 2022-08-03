<script setup lang="ts">
import { createPopper, Instance as PopperInstance } from '@popperjs/core';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import BalIcon, { IconSize } from '../BalIcon/BalIcon.vue';

type Placement = 'top' | 'left' | 'bottom' | 'right';
type TextAlign = 'left' | 'center' | 'right' | '';

type Props = {
  text?: string;
  placement?: Placement;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  onShow?: () => void;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  onHide?: () => void;
  noPad?: boolean;
  disabled?: boolean;
  iconSize?: IconSize;
  iconName?: string;
  iconClass?: string;
  width?: string;
  textAlign?: TextAlign;
  delayMs?: number;
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
  iconClass: 'text-gray-300',
  delayMs: 0,
});

const activator = ref<HTMLElement>();
const content = ref<HTMLElement>();
const popper = ref<PopperInstance>();

let delayTimeout: ReturnType<typeof setTimeout>;

const tooltipClasses = computed(() => {
  return {
    [`w-${props.width}`]: true,
    [`text-${props.textAlign}`]: props.textAlign !== '',
  };
});

const tooltipPad = computed(() => {
  return {
    'p-3': !props.noPad,
  };
});

// show the tooltip
function showTooltip() {
  if (content.value && popper.value) {
    content.value.setAttribute('data-show', '');
    popper.value.update();
    props.onShow && props.onShow();
  }
}

// hide the tooltip
function hideTooltip() {
  if (content.value) {
    content.value.removeAttribute('data-show');
    props.onHide && props.onHide();
  }
}

function handleMouseEnter() {
  if (!props.disabled) {
    if (props.delayMs > 0) {
      delayTimeout = setTimeout(showTooltip, props.delayMs);
    } else {
      showTooltip();
    }
  }
}

function handleMouseLeave() {
  if (!props.disabled) {
    if (delayTimeout != null) {
      clearTimeout(delayTimeout);
    }
    hideTooltip();
  }
}

onMounted(() => {
  if (activator.value && content.value) {
    popper.value = createPopper(activator.value, content.value, {
      placement: props.placement,
      modifiers: [
        { name: 'offset', options: { offset: [0, 8] } },
        { name: 'eventListeners', options: { scroll: false } },
      ],
    });
  }
});

onUnmounted(() => {
  if (delayTimeout != null) {
    clearTimeout(delayTimeout);
  }
});
</script>
<template>
  <button
    ref="activator"
    :class="['leading-none', { 'cursor-default': disabled }]"
    v-bind="$attrs"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot name="activator">
      <BalIcon :name="iconName" :size="iconSize" :class="iconClass" />
    </slot>
  </button>
  <div ref="content" class="tooltip" :class="tooltipClasses">
    <div :class="tooltipPad" class="font-medium tooltip-content">
      <p v-if="text" class="tooltip-text" v-text="text" />
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
.tooltip::before {
  @apply w-full h-full block absolute top-0 left-0 opacity-0 blur-2xl;

  background-blend-mode: soft-light, soft-light, normal;
  background: radial-gradient(ellipse at center, rgb(0 0 0 / 60%), transparent);
  content: '';
  filter: blur(40px);
  z-index: -1;
  animation: fadeIn 0.4s ease-out 0.05s both;
}

/* Dark mode radial gradient shadow */
.dark .tooltip::before {
  background-blend-mode: soft-light, soft-light, normal;
  background: radial-gradient(ellipse at left, yellow, transparent),
    radial-gradient(ellipse at bottom right, blue, transparent),
    radial-gradient(ellipse at top, red, transparent);
  content: '';
}

.tooltip[data-show] {
  @apply block;
}

.tooltip-content {
  @apply rounded-md text-xs text-black dark:text-white bg-white dark:bg-gray-900;
}

.tooltip[data-popper-placement='top'] .tooltip-content {
  @apply opacity-0;

  animation: fadeInMoveUp 0.2s ease-out both;
}

.tooltip[data-popper-placement='bottom'] .tooltip-content {
  @apply opacity-0;

  animation: fadeInMoveDown 0.2s ease-out both;
}

.tooltip[data-popper-placement='top'] .tooltip-content::before,
.tooltip[data-popper-placement='bottom'] .tooltip-content::after {
  @apply w-0 h-0 absolute;

  content: ' ';
  left: calc(50% - 7px);
}

/* bottom triangle for top placed tooltips */
.tooltip[data-popper-placement='top'] .tooltip-content::before {
  border-top: solid #fff 8px;
  border-left: solid transparent 8px;
  border-right: solid transparent 8px;
  bottom: -7px;
}

.dark .tooltip[data-popper-placement='top'] .tooltip-content::before {
  border-top: solid #0f172a 8px; /* gray-900 */
}

/* Top triangle for top placed tooltips */
.tooltip[data-popper-placement='bottom'] .tooltip-content::after {
  @apply -top-2;

  border-left: solid transparent 8px;
  border-right: solid transparent 8px;
  border-bottom: solid #fff 8px;
}

.dark .tooltip[data-popper-placement='bottom'] .tooltip-content::after {
  border-bottom: solid #0f172a 8px; /* gray-900 */
}

.tooltip-text {
  animation: fadeIn 0.5s ease-out 0.05s both;
}
</style>
