<script setup lang="ts">
import { useClassName } from '@/components/utils';
import { computed } from 'vue';

type StackOrientation = 'horizontal' | 'vertical';
type Spacing = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | 'none';
type Props = {
  vertical?: boolean;
  horizontal?: boolean;
  spacing: Spacing;
  withBorder?: boolean;
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
  vertical: true,
  spacing: 'base'
});

const spacingClass = computed(() => {
  const spacingType = props.vertical ? 'mb' : 'mr';
  return `${spacingType}-${SpacingMap[props.spacing]}`;
});
</script>

<template>
  <div
    :class="[
      'flex',
      {
        'flex-row': horizontal,
        'flex-col': vertical
      }
    ]"
  >
    <div
      v-for="(child, i) in $slots.default()"
      :key="`stack-child-${i}`"
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
