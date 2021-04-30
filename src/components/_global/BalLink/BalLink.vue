<template>
  <a class="text-blue-500 hover:underline" v-bind="attrs_">
    <slot />
  </a>
</template>

<script>
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BalLink',

  props: {
    external: {
      type: Boolean,
      default: false
    }
  },

  setup(props, { attrs }) {
    const attrs_ = computed(() => {
      let attrs_ = attrs;

      if (props.external) {
        attrs_ = {
          ...attrs_,
          target: '_blank',
          rel: 'noopener noreferrer'
        };
      }

      return attrs_;
    });

    return { attrs_ };
  }
});
</script>
