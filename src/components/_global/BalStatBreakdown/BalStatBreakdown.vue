<script setup lang="ts">
/**
 * TYPES
 */
type Props = {
  items: Array<any>;
  stat?: string;
  hideItems?: boolean;
};

/**
 * PROPS
 */
withDefaults(defineProps<Props>(), {
  stat: 'Stat',
  hideItems: false
});
</script>

<template>
  <div>
    <div class="whitespace-nowrap flex items-center">
      <slot>
        {{ stat }}
      </slot>
    </div>
    <div v-if="!hideItems" class="whitespace-nowrap flex flex-col mt-2 ml-px">
      <div v-for="(item, i) in items" :key="i" class="flex items-center">
        <div v-if="i === 0" class="init-vert-bar" />
        <div v-else class="vert-bar" />
        <div class="horiz-bar" />
        <slot name="item" :item="item"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.horiz-bar {
  @apply h-px w-3 bg-gray-200 dark:bg-gray-700 mr-2;
}

.init-vert-bar {
  @apply w-px h-4 bg-gray-200 dark:bg-gray-700 -mt-4 -mr-px;
}

.vert-bar {
  @apply w-px h-8 bg-gray-200 dark:bg-gray-700 -mt-8 -mr-px;
}
</style>
