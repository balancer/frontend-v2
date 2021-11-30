<script setup lang="ts">
import { uniqueId } from 'lodash';
import { computed, useSlots } from 'vue';

type Spacing = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'none';
type Props = {
  vertical?: boolean;
  horizontal?: boolean;
  spacing?: Spacing;
  withBorder?: boolean;
  ref?: any;
  align?: 'center' | 'start' | 'end' | 'between';
  justify?: 'center' | 'start' | 'end' | 'between';
  isDynamic?: boolean;
  expandChildren?: boolean;
};

const SpacingMap: Record<Spacing, number> = {
  xs: 1,
  sm: 2,
  base: 4,
  lg: 8,
  xl: 12,
  '2xl': 16,
  none: 0
};

const props = withDefaults(defineProps<Props>(), {
  spacing: 'base'
});

const spacingClass = computed(() => {
  const spacingType = props.vertical ? 'mb' : 'mr';
  return `${spacingType}-${SpacingMap[props.spacing]}`;
});

const stackId = uniqueId();
const slots = useSlots();

const slotsWithContent = computed(() => {
  if (props.isDynamic) {
    if (Array.isArray(slots.default()[0].children)) {
      return (slots.default()[0].children as any[]).filter(
        child => child.children !== 'v-if'
      );
    }
  }
  return slots.default().filter(slot => {
    if (slot.children !== 'v-if') return true;
    return false;
  });
});
</script>

<template>
  <div
    :class="[
      'flex',
      {
        'flex-row': horizontal,
        'flex-col': vertical,
        'items-center': align === 'center',
        'items-start': align === 'start',
        'items-end': align === 'end',
        'items-between': align === 'between',
        'justify-center': justify === 'center',
        'justify-start': justify === 'start',
        'justify-end': justify === 'end',
        'justify-between': justify === 'between'
      }
    ]"
  >
    <component
      v-for="(child, i) in slotsWithContent"
      :key="`stack-${stackId}-child-${i}-${child?.key || ''}`"
      :is="child"
      :class="{
        [spacingClass]: i !== slotsWithContent.length - 1,
        'border-b': i !== slotsWithContent.length - 1 && withBorder && vertical,
        'border-r':
          i !== slotsWithContent.length - 1 && withBorder && horizontal,
        'w-full': expandChildren,
        'dark:border-gray-600': true
      }"
    />
  </div>
</template>
