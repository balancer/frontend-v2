<script lang="ts" setup>
import { computed, ref, useAttrs } from 'vue';

/**
 * TYPES
 */
type Props = {
  noFade?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  noFade: false
});

/**
 * STATE
 */
const loaded = ref(props.noFade);

/**
 * COMPOSABLES
 */
const attrs = useAttrs();

/**
 * COMPUTED
 */
const wrapperStyles = computed(() => ({
  width: attrs?.width || 'auto',
  height: attrs?.height || 'auto'
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
      <img v-bind="$attrs" @load="onLoaded" v-show="loaded" />
    </Transition>
  </div>
</template>

<style scoped>
/* Image fade animation */
.bal-image-fade-enter-active,
.bal-image-fade-leave-active {
  transition: all 0.5s ease-in-out 0.1s;
  transform: scale(1) translateY(0px);
}
.bal-image-fade-enter-from,
.bal-image-fade-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(10px);
}
</style>
