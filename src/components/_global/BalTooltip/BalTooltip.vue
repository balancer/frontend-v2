<script setup lang="ts">
import { createPopper, Instance as PopperInstance } from '@popperjs/core';
import { computed, onMounted, onUnmounted, ref } from 'vue';

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
  delayMs: 0
});

const activator = ref<HTMLElement>();
const content = ref<HTMLElement>();
const popper = ref<PopperInstance>();

let delayTimeout: NodeJS.Timeout;

const tooltipClasses = computed(() => {
  return {
    'p-3': !props.noPad,
    [`w-${props.width}`]: true,
    [`text-${props.textAlign}`]: props.textAlign !== ''
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
      modifiers: [{ name: 'offset', options: { offset: [0, 5] } }]
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
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :class="['leading-none', { 'cursor-default': disabled }]"
    v-bind="$attrs"
  >
    <slot name="activator">
      <BalIcon :name="iconName" :size="iconSize" :class="iconClass" />
    </slot>
  </button>
  <div
    ref="content"
    class="tooltip text-xs text-black dark:text-white bg-white dark:bg-gray-800 font-medium shadow rounded-md border dark:border-gray-900 z-50"
    :class="tooltipClasses"
    v-bind="$attrs"
  >
    <p v-if="text" v-text="text" />
    <slot v-else />
  </div>
</template>
<style>
.tooltip {
  display: none;
}

.tooltip[data-show] {
  display: block;
}
</style>
