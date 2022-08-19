<script lang="ts" setup>
import { computed, ref } from 'vue';

/**
 * TYPES
 */
type Props = {
  noFade?: boolean;
  width?: string;
  height?: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  noFade: false,
  width: 'auto',
  height: 'auto',
});

/**
 * STATE
 */
const loaded = ref(props.noFade);

/**
 * COMPUTED
 */
const wrapperStyles = computed(() => ({
  width: props.width,
  height: props.height,
}));

/**
 * METHODS
 */
function onLoaded() {
  loaded.value = true;
}
</script>

<template>
  <div class="bal-image-wrapper" :style="wrapperStyles">
    <Transition name="bal-image-fade">
      <img
        v-show="loaded"
        :width="props.width"
        :height="props.height"
        v-bind="$attrs"
        @load="onLoaded"
      />
    </Transition>
  </div>
</template>

<style scoped>
/* Image fade animation */
.bal-image-fade-enter-active,
.bal-image-fade-leave-active {
  transition: all 0.5s ease-in-out 0.1s;
  transform: scale(1) translateY(0);
}

.bal-image-fade-enter-from,
.bal-image-fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(10px);
}
</style>
