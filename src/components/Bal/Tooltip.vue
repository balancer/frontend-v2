<template>
  <div
    @keyup.esc="closePopover"
    class="bal-tooltip relative inline-block leading-none"
    @mouseover="handleMouseover"
    @mouseout="handleMouseout"
  >
    <div
      class="activator inline-block"
      ref="activator"
      @click="showPopover = !showPopover"
      @mouseover="isOverActivator = true"
      @mouseout="isOverActivator = false"
    >
      <slot name="activator"></slot>
    </div>
    <transition name="tooltip-bottom">
      <div
        ref="contents"
        v-if="showPopover"
        :class="[
          'bal-tooltip-contents bg-white border absolute shadow-lg rounded-lg mt-1',
          contentClasses
        ]"
        :style="contentStyles"
        @mouseover="isOverContent = true"
        @mouseout="isOverContent = false"
      >
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
/*
  REFACTOR
  This component is a quick hack and should be refactored to be more usable.
  Currently, to be used, the width and height must be set for every usage
  in order to correctly position the tooltip relative to the activator.
  Ideally at least the height would be automatic.
*/

import {
  defineComponent,
  reactive,
  toRefs,
  ref,
  onMounted,
  computed
} from 'vue';

export default defineComponent({
  name: 'BalTooltip',

  props: {
    width: { type: Number, default: 200 },
    height: { type: Number, default: 0 },
    onHover: { type: Boolean, default: false },
    top: { type: Boolean, default: false },
    bottom: { type: Boolean, default: false },
    left: { type: Boolean, default: false },
    right: { type: Boolean, default: false },
    rightAligned: { type: Boolean, default: false },
    leftAligned: { type: Boolean, default: false }
  },

  setup(props) {
    const activator = ref({} as HTMLElement);

    const data = reactive({
      popoverXPosition: 0,
      popoverYPosition: 0,
      showPopover: false,
      isOverContent: false,
      isOverActivator: false,
      timer: 0
    });

    const position = computed(() => {
      if (props.top) {
        if (props.left) return 'top-left';
        if (props.right) return 'top-right';
        return 'top';
      } else {
        if (props.left) return 'bottom-left';
        if (props.right) return 'bottom-right';
        return 'bottom';
      }
    });

    const contentClasses = computed(() => {
      return {
        [`bal-tooltip-contents-${position.value}`]: true
      };
    });

    const contentPosition = computed(() => {
      if (props.top) {
        return {
          left: `-${data.popoverXPosition}px`,
          top: `-${data.popoverYPosition}px`
        };
      } else {
        return {
          left: `-${data.popoverXPosition}px`,
          top: `${data.popoverYPosition}px`
        };
      }
    });

    const contentStyles = computed(() => {
      return {
        width: `${props.width}px`,
        height: props.height === 0 ? 'auto' : `${props.height}px`,
        ...contentPosition.value
      };
    });

    function closePopover() {
      console.log('close');
      data.showPopover = false;
    }

    function handleMouseover() {
      if (props.onHover) {
        data.timer = window.setTimeout(() => {
          data.showPopover = true;
        }, 200);
      }
    }

    function handleMouseout() {
      if (props.onHover) {
        clearTimeout(data.timer);
        data.timer = window.setTimeout(() => {
          if (!data.isOverContent && !data.isOverActivator) {
            data.showPopover = false;
          }
        }, 200);
      }
    }

    onMounted(() => {
      const activatorPosition = activator.value.getBoundingClientRect();

      if (props.right) {
        data.popoverXPosition = 0;
      } else if (props.left) {
        data.popoverXPosition = props.width - 15;
      } else if (props.leftAligned) {
        data.popoverXPosition = 0;
      } else if (props.rightAligned) {
        data.popoverXPosition = props.width - activatorPosition.width;
      } else {
        data.popoverXPosition = props.width / 2 - activatorPosition.width / 2;
      }

      if (props.top && props.height !== 0) {
        data.popoverYPosition = props.height + 5;
      } else if (props.bottom) {
        data.popoverYPosition = activatorPosition.height;
      }
    });

    return {
      ...toRefs(data),
      activator,
      contentClasses,
      contentStyles,
      closePopover,
      handleMouseout,
      handleMouseover
    };
  }
});
</script>

<style>
.bal-tooltip {
  z-index: 999;
}

.tooltip-bottom-enter-active {
  transform-origin: top center;
  animation: tooltip-in 0.25s;
  animation-timing-function: ease-in-out;
}

.tooltip-bottom-leave-active {
  transform-origin: top center;
  animation: tooltip-in 0.25s reverse;
  animation-timing-function: ease-in-out;
}

@keyframes tooltip-in {
  0% {
    opacity: 0;
    transform: skewX(3deg) translateY(3px);
  }
  100% {
    opacity: 1;
    transform: skewX(0deg) translateY(0px);
  }
}
</style>
