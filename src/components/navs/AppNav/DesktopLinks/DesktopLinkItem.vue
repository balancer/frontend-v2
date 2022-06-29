<script lang="ts" setup>
import { computed } from 'vue';

type Props = {
  active: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  active: false
});

const classes = computed(() => ({
  'border-white dark:border-gray-900': !props.active,
  'border-blue-600 dark:border-yellow-500 text-blue-600 dark:text-yellow-500':
    props.active
}));
</script>

<template>
  <router-link :class="['desktop-link-item', classes]">
    <slot />
  </router-link>
</template>

<style scoped>
.desktop-link-item {
  @apply transition ease-in-out duration-500;
  @apply border-t-4 hover:border-blue-500;
  @apply h-full flex flex-col justify-center;
  @apply cursor-pointer hover:text-blue-500;
}
</style>
