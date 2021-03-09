<template>
  <span>
    <i :data-feather="name" :width="_size" :height="_size" />
  </span>
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
    const _size = computed(() => {
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

    return { _size };
  }
});
</script>
