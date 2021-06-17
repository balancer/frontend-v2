<template>
  <div class="relative" v-click-outside="handleClickOutside">
    <div
      class="bal-popover-activator group"
      @click="trigger === 'click' && togglePopover()"
      @mouseenter="trigger === 'hover' && showPopover()"
      @mouseleave="trigger === 'hover' && hidePopover()"
    >
      <slot name="activator" />
    </div>
    <div :class="popoverWrapperClasses">
      <BalCard shadow="lg" v-bind="$attrs">
        <slot />
      </BalCard>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType } from 'vue';

type PopoverTrigger = 'click' | 'hover';

export default defineComponent({
  name: 'BalPopover',

  props: {
    trigger: {
      type: String as PropType<PopoverTrigger>,
      default: 'click'
    }
  },
  setup(props) {
    // DATA
    const popoverOpened = ref(false);

    // METHODS
    function togglePopover() {
      popoverOpened.value = !popoverOpened.value;
    }

    function showPopover() {
      popoverOpened.value = true;
    }

    function hidePopover() {
      popoverOpened.value = false;
    }

    function handleClickOutside() {
      if (props.trigger === 'click') {
        hidePopover();
      }
    }

    // COMPUTED
    const popoverWrapperClasses = computed(() => ({
      'bal-popover-wrapper': true,
      'bal-popover-wrapper-visible': popoverOpened.value
    }));

    return {
      // methods
      togglePopover,
      showPopover,
      hidePopover,
      handleClickOutside,

      // computed
      popoverWrapperClasses
    };
  }
});
</script>

<style>
.bal-popover-wrapper {
  @apply top-full invisible opacity-0 absolute z-10 pt-3 right-0;
  transition: all 0.2s ease-in-out;
}

.bal-popover-wrapper-visible {
  @apply visible opacity-100;
}

.bal-popover-wrapper:hover {
  @apply visible opacity-100;
}

.bal-popover-activator .feather-settings {
  @apply transition-all duration-200 ease-out;
}

.bal-popover-activator:hover .feather-settings {
  transform: scale(1.2) rotate(-45deg);
}
.bal-popover-activator:hover .icon-container {
  @apply text-blue-500;
}
</style>
