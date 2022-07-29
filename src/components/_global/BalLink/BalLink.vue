<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>

<script lang="ts" setup>
import { computed, useAttrs } from 'vue';

/**
 * TYPES
 */
type LinkTag = 'a' | 'router-link';

type Props = {
  tag?: LinkTag;
  external?: boolean;
  disabled?: boolean;
  noStyle?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  tag: 'a',
  external: false,
  disabled: false,
  noStyle: false,
});

/**
 * COMPOSABLES
 */
const attrs = useAttrs();

/**
 * COMPUTED
 */
const attrs_ = computed(() => {
  let attrs_ = attrs;

  if (props.external) {
    attrs_ = {
      ...attrs_,
      target: '_blank',
      rel: 'noopener noreferrer',
    };
  }

  return attrs_;
});

const classes = computed(() => {
  return {
    link: !props.noStyle,
    'disabled-link': props.disabled,
  };
});
</script>

<template>
  <component :is="tag" :class="[classes]" v-bind="attrs_">
    <slot />
  </component>
</template>

<style scoped>
.disabled-link {
  pointer-events: none;
}
</style>
