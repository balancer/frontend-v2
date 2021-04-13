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
    class="tooltip p-2 text-xs font-medium shadow-md rounded-md border"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { createPopper, Instance as PopperInstance } from '@popperjs/core';
import BalIcon from '../Bal/Icon.vue';

export default defineComponent({
  name: 'Tooltip',
  components: { BalIcon },
  setup() {
    const activator = ref<HTMLElement>();
    const content = ref<HTMLElement>();
    const popper = ref<PopperInstance>();

    // show the tooltip
    const handleMouseEnter = () => {
      if (content.value && popper.value) {
        content.value.setAttribute('data-show', '');
        popper.value.update();
      }
    };

    // hide the tooltip
    const handleMouseLeave = () => {
      if (content.value) {
        content.value.removeAttribute('data-show');
      }
    };

    onMounted(() => {
      if (activator.value && content.value) {
        popper.value = createPopper(activator.value, content.value, {
          placement: 'top',
          modifiers: [{ name: 'offset', options: { offset: [0, 5] } }]
        });
      }
    });

    return {
      activator,
      content,
      handleMouseEnter,
      handleMouseLeave
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
