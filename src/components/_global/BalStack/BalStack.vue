<script setup lang="ts">
import { computed, useSlots } from 'vue';

type Spacing = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'none';
type Props = {
  vertical?: boolean;
  horizontal?: boolean;
  spacing: Spacing;
  withBorder?: boolean;
  ref?: any;
  align?: 'center' | 'start' | 'end';
  justify?: 'center' | 'start' | 'end';
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

const stackId = Math.random();
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
        'justify-center': justify === 'center',
        'justify-start': justify === 'start',
        'justify-end': justify === 'end'
      }
    ]"
  >
    <div
      v-for="(child, i) in $slots.default()"
      :key="`stack-${stackId}-child-${i}`"
      :class="{
        [spacingClass]: i !== $slots.default().length - 1,
        'border-b': i !== $slots.default().length - 1 && withBorder && vertical,
        'border-r':
          i !== $slots.default().length - 1 && withBorder && horizontal
      }"
    >
      <component :is="child" />
    </div>
  </div>
</template>
