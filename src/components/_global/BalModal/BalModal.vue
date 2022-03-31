<script lang="ts" setup>
import { ref, defineExpose } from 'vue';
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
withDefaults(defineProps<Props>(), {
  show: false,
  title: '',
  noPad: false,
  noContentPad: false,
  fireworks: false
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

/**
 * EXPOSE
 */
defineExpose({ hide });
</script>

<template>
  <div v-if="show" class="bal-modal" @keyup.esc="hide">
    <transition name="overlay" @afterEnter="showContent = true" appear>
      <div class="modal-bg" @click="hide">
        <div v-if="fireworks" class="fireworks">
          <div class="before"></div>
          <div class="after"></div>
        </div>
      </div>
    </transition>
    <div class="content-container">
      <Transition name="modal" @afterLeave="$emit('close')">
        <div v-if="showContent" class="content">
          <BalCard
            :title="title"
            shadow="lg"
            :no-pad="noPad"
            :no-content-pad="noContentPad"
            class="modal-card"
            noBorder
            overflowYScroll
          >
            <template v-if="$slots.header" v-slot:header>
              <slot name="header" />
            </template>
            <slot />
            <template v-if="$slots.footer" v-slot:footer>
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
}

.modal-bg {
  @apply absolute h-full w-full bg-black bg-opacity-80;
}

.modal-card {
  @apply mx-auto h-full rounded-b-none sm:rounded-b-lg dark:border dark:border-gray-800;
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
  transition: all 0.2s ease-in-out;
}
.modal-enter-from,
.modal-leave-to {
  transform: translateY(50px);
  opacity: 0;
}
</style>
