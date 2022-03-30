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
  transition: all 0.3s ease-in-out;
}
.bal-image-fade-enter-from,
.bal-image-fade-leave-to {
  opacity: 0;
}
</style>
