<template>
  <div v-if="show" class="bal-modal" @click="hide" @keyup.esc="hide">
    <transition name="modal-bg" mode="out-in" appear>
      <div v-if="showContent" class="modal-bg" @click="hide">
        <div v-if="fireworks" class="fireworks">
          <div class="before"></div>
          <div class="after"></div>
        </div>
      </div>
    </transition>
    <div class="content-container">
      <AnimatePresence
        :initial="{ opacity: 0, translateY: 7.5 }"
        :animate="{
          opacity: 1,
          translateY: 0,
          delay: 100
        }"
        :exit="{ opacity: 0, translateY: 15 }"
        :isVisible="showContent"
        @on-exit="$emit('close')"
        class="flex justify-center w-full"
      >
        <div class="content" @click.stop>
          <BalCard
            :title="title"
            shadow="lg"
            :no-pad="noPad"
            :no-content-pad="noContentPad"
            class="modal-card"
            no-border
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
      </AnimatePresence>
    </div>
  </div>
</template>

<script lang="ts">
import BalCard from '../BalCard/BalCard.vue';
import AnimatePresence from '../../animate/AnimatePresence.vue';
import { defineComponent, ref, toRefs, watch } from 'vue';

export default defineComponent({
  name: 'BalModal',

  components: {
    BalCard,
    AnimatePresence
  },

  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
    noPad: { type: Boolean, default: false },
    noContentPad: { type: Boolean, default: false },
    fireworks: { type: Boolean, default: false }
  },

  setup(props) {
    const { show } = toRefs(props);
    const showContent = ref(show.value);

    // Watchers
    watch(show, newVal => {
      showContent.value = newVal;
    });

    // Methods
    function hide(): void {
      showContent.value = false;
    }

    return {
      showContent,
      hide
    };
  }
});
</script>

<style scoped>
.bal-modal {
  @apply top-0 left-0 fixed h-screen w-full z-40;
}

.content-container {
  @apply flex h-screen items-end sm:items-center justify-center;
}

.content {
  @apply relative w-full h-3/4 sm:h-auto max-h-screen overflow-hidden;
  max-width: 450px;
}

.modal-bg {
  @apply absolute h-full w-full bg-black bg-opacity-80;
}

.modal-card {
  @apply mx-auto h-full rounded-b-none sm:rounded-b-lg dark:border dark:border-gray-800;
}

.modal-bg-enter-active {
  transition: all 0.3s ease-in-out;
}

.modal-bg-leave-active {
  transition: all 0.3s ease-in-out;
}

.modal-bg-enter-from,
.modal-bg-leave-to {
  background: transparent;
}
</style>
