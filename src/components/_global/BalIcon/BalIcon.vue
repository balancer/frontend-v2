<template>
  <div class="bal-icon inline-block">
    <i :data-feather="name" :width="iconSize" :height="iconSize" :fill="fill" />
  </div>
</template>

<script lang="ts">
import feather from 'feather-icons';
import { computed, defineComponent, onMounted } from 'vue';

export type IconSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export default defineComponent({
  name: 'BalIcon',

  props: {
    name: { type: String, required: true },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => {
        return ['xxs', 'xs', 'sm', 'md', 'lg', 'xl'].includes(val);
      }
    },
    filled: { type: Boolean, default: false }
  },

  setup(props) {
    const iconSize = computed(() => {
      switch (props.size) {
        case 'xxs':
          return '8';
        case 'xs':
          return '12';
        case 'sm':
          return '16';
        case 'lg':
          return '24';
        case 'xl':
          return '28';
        default:
          return '20';
      }
    });

    const fill = computed(() => (props.filled ? 'currentColor' : 'none'));

    onMounted(() => feather.replace());

    return { iconSize, fill };
  }
});
</script>
