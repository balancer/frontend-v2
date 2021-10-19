<template>
  <button
    ref="activator"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    :class="['leading-none', { 'cursor-default': disabled }]"
    v-bind="$attrs"
  >
    <slot name="activator">
      <BalIcon name="info" :size="iconSize" class="text-gray-300" />
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

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import { createPopper, Instance as PopperInstance } from '@popperjs/core';
import BalIcon from '../BalIcon/BalIcon.vue';

type Placement = 'top' | 'left' | 'bottom' | 'right';

export default defineComponent({
  name: 'Tooltip',
  components: { BalIcon },
  props: {
    text: { type: String, default: '' },
    placement: { type: String as PropType<Placement>, default: 'top' },
    onShow: { type: Function },
    onHide: { type: Function },
    noPad: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    iconSize: { type: String, defailt: 'md' },
    width: { type: String, default: '52' },
    textCenter: { type: Boolean, default: false }
  },
  setup(props) {
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

    return {
      activator,
      content,
      handleMouseEnter,
      handleMouseLeave,
      tooltipClasses
    };
  }
});
</script>

<style>
.tooltip {
  display: none;
}

.tooltip[data-show] {
  display: block;
}
</style>
