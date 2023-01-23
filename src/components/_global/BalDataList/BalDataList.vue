<script setup lang="ts">
type Props = {
  title: string;
  hTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};

withDefaults(defineProps<Props>(), {
  title: 'Summary',
  hTag: 'h6',
});
</script>

<template>
  <div
    class="mt-4 rounded-lg border dark:border-gray-700 divide-y dark:divide-gray-700"
  >
    <component :is="hTag" class="p-2">
      {{ title }}
    </component>
    <div class="flex flex-col py-2">
      <slot />
    </div>
  </div>
</template>
