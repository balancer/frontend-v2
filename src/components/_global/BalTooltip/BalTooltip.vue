<template>
  <button
    ref="activator"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <slot name="activator">
      <BalIcon name="info" size="md" class="text-gray-400" />
    </slot>
  </button>
  <div
    ref="content"
    class="tooltip text-xs bg-white text-black font-medium shadow rounded-md border z-50"
    :class="tooltipClasses"
    v-bind="$attrs"
  >
    <slot />
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
    placement: { type: String as PropType<Placement>, default: 'top' },
    onShow: { type: Function },
    onHide: { type: Function },
    noPad: { type: Boolean, default: false }
  },
  setup(props) {
    const activator = ref<HTMLElement>();
    const content = ref<HTMLElement>();
    const popper = ref<PopperInstance>();

    const tooltipClasses = computed(() => {
      return {
        'p-3': !props.noPad
      };
    });

    // show the tooltip
    const handleMouseEnter = () => {
      if (content.value && popper.value) {
        content.value.setAttribute('data-show', '');
        popper.value.update();
        props.onShow && props.onShow();
      }
    };

    // hide the tooltip
    const handleMouseLeave = () => {
      if (content.value) {
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
