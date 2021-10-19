<script setup lang="ts">
import { computed } from 'vue';

/**
 * TYPES
 */
type Props = {
  items: Array<any>;
  title?: string;
  hideItems?: boolean;
  size?: string;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  title: 'Title',
  hideItems: false,
  size: 'md'
});

/**
 * COMPUTED
 */
const initVertBarSizes = computed(() => {
  switch (props.size) {
    case 'lg':
      return 'h-8 -mt-8';
    default:
      return 'h-4 -mt-4';
  }
});

const vertBarSizes = computed(() => {
  switch (props.size) {
    case 'lg':
      return 'h-16 -mt-16';
    default:
      return 'h-8 -mt-8';
  }
});

const spacingClass = computed(() => {
  switch (props.size) {
    case 'lg':
      return 'mt-4';
    default:
      return 'mt-0';
  }
});

const offsetClass = computed(() => {
  switch (props.size) {
    case 'lg':
      return 'mt-3';
    default:
      return 'mt-2';
  }
});
</script>

<template>
  <div>
    <div>
      <slot>
        {{ title }}
      </slot>
    </div>
    <div v-if="!hideItems" :class="['flex flex-col ml-px', offsetClass]">
      <div
        v-for="(item, i) in items"
        :key="i"
        :class="['flex items-center', { [spacingClass]: i !== 0 }]"
      >
        <div v-if="i === 0" :class="['init-vert-bar', initVertBarSizes]" />
        <div v-else :class="['vert-bar', vertBarSizes]" />
        <div class="horiz-bar" />
        <div class="flex-grow">
          <slot name="item" :item="item"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.horiz-bar {
  @apply h-px w-3 bg-gray-200 dark:bg-gray-700 mr-2;
}

.init-vert-bar {
  @apply w-px bg-gray-200 dark:bg-gray-700 -mr-px;
}

.vert-bar {
  @apply w-px bg-gray-200 dark:bg-gray-700 -mr-px;
}
</style>
