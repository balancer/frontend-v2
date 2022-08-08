<script lang="ts" setup>
import { ref, watch } from 'vue';

import BalCard from '../BalCard/BalCard.vue';

/**
 * TYPES
 */
type Props = {
  show?: boolean;
  title?: string;
  noPad?: boolean;
  noContentPad?: boolean;
  fireworks?: boolean;
};

/**
 * PROPS & EMITS
 */

const props = withDefaults(defineProps<Props>(), {
  show: false,
  title: '',
  noPad: false,
  noContentPad: false,
  fireworks: false,
});

defineEmits(['close']);

/**
 * STATE
 */
const showContent = ref(false);

/**
 * METHODS
 */
function hide(): void {
  showContent.value = false;
}

watch(
  () => props.show,
  () => {
    if (props.show) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }
);

/**
 * EXPOSE
 */
defineExpose({ hide });
</script>

<template>
  <div v-if="show" class="bal-modal" @keyup.esc="hide">
    <transition name="overlay" appear @after-enter="showContent = true">
      <div class="modal-bg" @click="hide">
        <div v-if="fireworks" class="fireworks">
          <div class="before" />
          <div class="after" />
        </div>
      </div>
    </transition>
    <div class="content-container">
      <Transition name="modal" @after-leave="$emit('close')">
        <div v-if="showContent" class="content">
          <BalCard
            :title="title"
            shadow="lg"
            :noPad="noPad"
            :noContentPad="noContentPad"
            class="modal-card"
            noBorder
            overflowYScroll
          >
            <template v-if="$slots.header" #header>
              <slot name="header" />
            </template>
            <slot />
            <template v-if="$slots.footer" #footer>
              <slot name="footer" />
            </template>
          </BalCard>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.bal-modal {
  @apply top-0 left-0 fixed h-screen w-full z-40;
}

.content-container {
  @apply flex h-screen items-end sm:items-center justify-center;
}

.content {
  @apply relative w-full h-3/4 sm:h-auto max-h-screen;

  max-width: 450px;
  transform-style: preserve-3d;
}

.modal-bg {
  @apply absolute h-full w-full bg-black bg-opacity-90;
}

.modal-card {
  @apply mx-auto h-full rounded-b-none sm:rounded-b-lg dark:border-0;
}

.dark .bal-modal .content::before {
  background-blend-mode: soft-light, soft-light, normal;
  background: radial-gradient(circle at left, yellow, transparent),
    radial-gradient(circle at bottom right, blue, transparent),
    radial-gradient(circle at top, red, transparent);
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: -1;
  filter: blur(80px);
  transform: translateZ(-1px);
  animation: fadeInMoveUpScaleUp 0.2s ease-out both;
}

/* Overlay animation */
.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.2s ease-in-out;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Modal animation */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
