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
    'p-3': !props.noPad,
    [`w-${props.width}`]: true,
    [`text-${props.textAlign}`]: props.textAlign !== ''
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
  <div
    ref="content"
    class="tooltip text-xs text-black dark:text-white bg-white dark:bg-gray-800 font-medium shadow-2xl rounded-md border dark:border-gray-900 z-50"
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
  position: relative;
}

.tooltip[data-show] {
  display: block;
}

.tooltip[data-popper-placement='top']:before {
  border-left: solid transparent 8px;
  border-right: solid transparent 8px;
  border-top: solid rgba(234, 240, 246, 1) 8px;
  bottom: 0;
  content: ' ';
  height: 0;
  bottom: -9px;
  left: calc(50% - 7px);
  position: absolute;
  width: 0;
}

.tooltip[data-popper-placement='top']:after {
  border-left: solid transparent 8px;
  border-right: solid transparent 8px;
  border-top: solid #fff 8px;
  bottom: -8px;
  content: ' ';
  height: 0;
  left: calc(50% - 7px);
  position: absolute;
  width: 0;
}

.tooltip[data-popper-placement='bottom']:before {
  border-left: solid transparent 8px;
  border-right: solid transparent 8px;
  border-bottom: solid rgba(234, 240, 246, 1) 8px;
  bottom: 0;
  content: ' ';
  height: 0;
  top: -9px;
  left: calc(50% - 7px);
  position: absolute;
  width: 0;
}

.tooltip[data-popper-placement='bottom']:after {
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

/* .tooltip[data-popper-placement="bottom"] {
  background: green;
} */
</style>
