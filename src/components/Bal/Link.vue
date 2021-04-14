<template>
  <a v-bind="_attrs">
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
    const _attrs = computed(() => {
      let _attrs = attrs;

      if (props.external) {
        _attrs = {
          ..._attrs,
          target: '_blank',
          rel: 'noopener noreferrer'
        };
      }

      return _attrs;
    });

    return { _attrs };
  }
});
</script>
