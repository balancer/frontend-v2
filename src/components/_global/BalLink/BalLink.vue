<template>
  <a :class="[classes]" v-bind="attrs_">
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
    },
    noStyle: {
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

    const classes = computed(() => {
      return {
        'text-blue-500 hover:underline': !props.noStyle
      }
    });

    return { attrs_, classes };
  }
});
</script>
