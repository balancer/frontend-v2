<script setup lang="ts">
import { computed } from 'vue';

/**
 * TYPES
 */
type Props = {
  amount?: string;
  tooltip?: string;
  size?: 'sm' | 'md' | 'lg';
};

/**
 * PROPS
 */
const props = withDefaults(defineProps<Props>(), {
  amount: '1',
  tooltip: `Limit amount`,
  size: 'md',
});

/**
 * COMPUTED
 */
const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-xxs p-0 w-5 h-5 leading-4';
    case 'lg':
      return 'text-md p-2 w-11 h-11';
    default:
      return 'text-sm p-1 w-8 h-8';
  }
});
</script>

<template>
  <BalTooltip textAlign="left">
    <template #activator>
      <div
        :class="sizeClass"
        class="inline-block font-medium text-center rounded-full border-2 border-red-600"
      >
        {{ amount }}
      </div>
    </template>
    <div>
      <div class="text-xs font-normal">
        {{ tooltip }}
      </div>
    </div>
  </BalTooltip>
</template>

<style scoped>
.text-xxs {
  font-size: 0.6rem;
  line-height: 1rem;
}
</style>
