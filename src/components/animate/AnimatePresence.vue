<template>
  <transition appear @enter="enter" @leave="leave" :css="false">
    <div id="animateContainer" ref="animateContainer" v-if="isVisible">
      <slot></slot>
    </div>
  </transition>
</template>

<script lang="ts">
import anime, { AnimeParams } from 'animejs';
import { defineComponent, onMounted, PropType, ref } from 'vue';
export default defineComponent({
  emits: ['on-exit'],
  props: {
    initial: {
      type: Object as PropType<AnimeParams>,
      required: true
    },
    animate: {
      type: Object as PropType<AnimeParams>,
      required: true
    },
    exit: {
      type: Object as PropType<AnimeParams>,
      required: true
    },
    isVisible: {
      type: Boolean,
      required: true
    }
  },
  setup(props, { emit }) {
    const animateContainer = ref<HTMLElement>();

    onMounted(() => {
      if (animateContainer.value) {
        anime.set(animateContainer.value, {
          ...props.initial
        });
      }
    });

    const enter = (el, done) => {
      // on mount we set initial values, but the issue is that enter will run at
      // the same time, setTimeout(0) makes the animation run on the next
      // available tick, so it's instant visually but on a tick delay for code
      setTimeout(
        () =>
          anime({
            targets: el,
            ...props.animate,
            easing: 'spring(0.2, 80, 10, 0)',
            complete: () => done()
          }),
        0
      );
    };

    const leave = (el, done) => {
      anime.set(el, {
        'pointer-events': 'none'
      });
      anime({
        targets: el,
        ...props.exit,
        easing: 'spring(0.2, 80, 10, 0)',
        complete: () => {
          done();
          emit('on-exit');
        }
      });
    };

    return {
      animateContainer,
      enter,
      leave
    };
  }
});
</script>
