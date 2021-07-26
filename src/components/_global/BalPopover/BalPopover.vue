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
      <BalCard shadow="lg" v-bind="$attrs" darkBgColor="800">
        <slot />
      </BalCard>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, PropType, watch } from 'vue';

type PopoverTrigger = 'click' | 'hover';

export default defineComponent({
  name: 'BalPopover',

  props: {
    trigger: {
      type: String as PropType<PopoverTrigger>,
      default: 'click'
    },
    align: { type: String, default: 'right' }
  },
  emits: ['show', 'hide'],
  setup(props, { emit }) {
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
      'bal-popover-wrapper-visible': popoverOpened.value,
      [`${props.align}-0`]: true
    }));

    watch(popoverOpened, () => {
      if (popoverOpened.value) {
        emit('show');
      } else {
        emit('hide');
      }
    });

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
  @apply top-full invisible opacity-0 absolute z-30 pt-3;
  transition: all 0.2s ease-in-out;
}

.bal-popover-wrapper-visible {
  @apply visible opacity-100;
}

.bal-popover-wrapper:hover {
  @apply visible opacity-100;
}
</style>
