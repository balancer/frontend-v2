<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { createPopper, Instance as PopperInstance } from '@popperjs/core';

import BalIcon, { IconSize } from '../BalIcon/BalIcon.vue';

type Placement = 'top' | 'left' | 'bottom' | 'right';

type Props = {
  text?: string;
  placement?: Placement;
  onShow: () => void;
  onHide: () => void;
  noPad?: boolean;
  disabled?: boolean;
  iconSize?: IconSize;
  iconName?: string;
  iconClass?: string;
  width?: string;
  textCenter?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  text: '',
  placement: 'top',
  noPad: false,
  disabled: false,
  width: '52',
  textCenter: false,
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
    'text-center': props.textCenter
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
      modifiers: [{ name: 'offset', options: { offset: [0, 5] } }]
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
