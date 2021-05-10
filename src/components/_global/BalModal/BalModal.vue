<template>
  <div v-if="show" class="bal-modal" @click="hide" @keyup.esc="hide">
    <transition name="modal-bg" mode="out-in" appear>
      <div v-if="showContent" class="modal-bg" @click="hide" />
    </transition>
    <div class="content-container">
      <transition
        name="content"
        mode="out-in"
        appear
        @after-leave="$emit('close')"
      >
        <div v-if="showContent" class="content" @click.stop>
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
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import BalCard from '../BalCard/BalCard.vue';
import { defineComponent, ref, toRefs, watch } from 'vue';

export default defineComponent({
  name: 'BalModal',

  components: {
    BalCard
  },

  props: {
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
    noPad: { type: Boolean, default: false },
    noContentPad: { type: Boolean, default: false }
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
  @apply top-0 left-0 fixed h-screen w-full;
  z-index: 9999999999;
}

.content-container {
  @apply flex h-screen items-end sm:items-center justify-center;
}

.content {
  @apply relative w-full h-3/4 sm:h-auto max-h-screen overflow-hidden;
  max-width: 500px;
}

.modal-bg {
  @apply absolute h-full w-full bg-black bg-opacity-50;
}

.modal-card {
  @apply w-full mx-auto h-full rounded-b-none sm:rounded-b-lg;
}

.content-enter-active {
  transition: all 0.2s ease-in-out;
}

.content-leave-active {
  transition: all 0.2s ease-in-out;
}

.content-enter-from,
.content-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
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
