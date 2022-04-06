<script lang="ts" setup>
import { computed } from 'vue';

import AppIcon from './AppIcon.vue';

/**
 * TYPES
 */
type Props = {
  forceDark?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  forceDark: false
});

/**
 * COMPUTED
 */
const textColor = computed(() =>
  props.forceDark ? 'text-white' : 'text-black dark:text-white'
);
</script>

<template>
  <div class="flex items-center">
    <AppIcon :forceDark="forceDark" />
    <span :class="['mr-1 font-secondary text-xl font-semibold', textColor]">
      Balancer
    </span>
  </div>
</template>
