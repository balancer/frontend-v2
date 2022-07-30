<template>
  <transition
    class="relative"
    appear
    :css="false"
    @enter="enter"
    @leave="leave"
  >
    <div v-if="isVisible" id="animateContainer" ref="animateContainer">
      <slot />
    </div>
  </transition>
</template>

<script lang="ts">
import anime, { AnimeParams } from 'animejs';
import {
  defineComponent,
  nextTick,
  onMounted,
  PropType,
  ref,
  watch,
} from 'vue';
export default defineComponent({
  props: {
    initial: {
      type: Object as PropType<AnimeParams>,
      default: () => ({
        opacity: 0,
      }),
    },
    animate: {
      type: Object as PropType<AnimeParams>,
      default: () => ({
        opacity: 1,
      }),
    },
    exit: {
      type: Object as PropType<AnimeParams>,
      default: () => ({
        opacity: 0,
      }),
    },
    unmountInstantly: {
      type: Boolean,
      default: () => false,
    },
    isVisible: {
      type: Boolean,
      default: () => true,
    },
  },
  emits: ['on-exit', 'update-dimensions', 'on-presence'],
  setup(props, { emit }) {
    const animateContainer = ref<HTMLElement>();

    onMounted(() => {
      if (animateContainer.value) {
        anime.set(animateContainer.value, {
          ...props.initial,
        });
      }
    });

    watch(
      () => props.isVisible,
      async () => {
        if (props.isVisible) {
          await nextTick();
          if (animateContainer.value) {
            anime.set(animateContainer.value, {
              ...props.initial,
            });
          }
        }
      }
    );

    const enter = async (el, done) => {
      // on mount we set initial values, but the issue is that enter will run at
      // the same time, setTimeout(0) makes the animation run on the next
      // available tick, so it's instant visually but on a tick delay for code
      emit('on-presence', { isCompleted: false });

      setTimeout(() => {
        anime({
          targets: el,
          ...props.animate,
          easing: 'spring(0.2, 80, 10, 0)',
          complete: () => {
            done();
            emit('on-presence', { isCompleted: true });
          },
        });
      }, 0);
      setTimeout(() => {
        if (animateContainer.value) {
          emit('update-dimensions', {
            width: animateContainer.value.offsetWidth,
            height: animateContainer.value.offsetHeight,
          });
        }
      }, 0);
    };

    const leave = (el, done) => {
      if (props.unmountInstantly) {
        done();
        emit('on-exit', { isCompleted: true });
      }
      anime.set(el, {
        'pointer-events': 'none',
      });
      anime({
        targets: el,
        ...props.exit,
        easing: 'spring(0.2, 80, 10, 0)',

        complete: () => {
          done();
          emit('on-exit', { isCompleted: true });
        },
      });
    };

    return {
      animateContainer,
      enter,
      leave,
    };
  },
});
</script>
