<template>
  <i :data-feather="name" :width="_size" :height="_size" />
</template>

<script lang="ts">
import feather from 'feather-icons';
import { computed, defineComponent, onMounted, toRefs } from 'vue';

export default defineComponent({
  name: 'BalIcon',

  props: {
    name: { type: String, required: true },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val)
    }
  },

  setup(props) {
    const { size } = toRefs(props);

    const _size = computed(() => {
      switch (size.value) {
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
