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
  offsetClassOverrides?: string;
  initVertBarClassOverrides?: string;
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  title: 'Title',
  hideItems: false,
  size: 'md',
  offsetClassOverrides: '',
  initVertBarClassOverrides: '',
});

/**
 * COMPUTED
 */
const initVertBarSizes = computed(() => {
  if (props.initVertBarClassOverrides != null) {
    return props.initVertBarClassOverrides;
  }

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
  if (props.offsetClassOverrides) {
    return props.offsetClassOverrides;
  }

  switch (props.size) {
    case 'lg':
      return 'mt-3 ml-px';
    default:
      return 'mt-2 ml-px';
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
    <div v-if="!hideItems" :class="['flex flex-col', offsetClass]">
      <div
        v-for="(item, i) in items"
        :key="i"
        :class="['flex items-center', { [spacingClass]: i !== 0 }]"
      >
        <div v-if="i === 0" :class="['init-vert-bar', initVertBarSizes]" />
        <div v-else :class="['vert-bar', vertBarSizes]" />
        <div class="horiz-bar" />
        <div class="flex-grow">
          <slot name="item" :item="item" />
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
