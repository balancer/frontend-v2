<script lang="ts" setup>
import feather from 'feather-icons';
import { computed, onMounted } from 'vue';

/**
 * TYPES
 */
export type IconSize = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type Props = {
  name: string;
  size?: IconSize;
  filled?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  filled: false,
});

/**
 * COMPUTED
 */
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

/**
 * LIFECYCLE
 */
onMounted(() => feather.replace());
</script>

<template>
  <div class="inline-block bal-icon">
    <i :data-feather="name" :width="iconSize" :height="iconSize" :fill="fill" />
  </div>
</template>
