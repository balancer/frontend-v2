<template>
  <i :data-feather="name" :width="iconSize" :height="iconSize" />
</template>

<script lang="ts">
import feather from 'feather-icons';
import { computed, defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'BalIcon',

  props: {
    name: { type: String, required: true },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => {
        return ['xs', 'sm', 'md', 'lg'].includes(val);
      }
    }
  },

  setup(props) {
    const iconSize = computed(() => {
      switch (props.size) {
        case 'xs':
          return '12';
        case 'sm':
          return '16';
        case 'lg':
          return '32';
        default:
          return '24';
      }
    });

    onMounted(() => feather.replace());

    return { iconSize };
  }
});
</script>
