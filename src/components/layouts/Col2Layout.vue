<script lang="ts" setup>
type Gap = '4' | '8';
type MaxWidth = '3xl';
type ColSpan = '5' | '6' | '7';
type Cols = '12';
type Props = {
  cols?: Cols;
  gap?: Gap;
  leftSpan?: ColSpan;
  rightSpan?: ColSpan;
  maxWidth?: MaxWidth;
};
withDefaults(defineProps<Props>(), {
  cols: '12',
  gap: '8',
  leftSpan: '6',
  rightSpan: '6',
  maxWidth: '3xl',
});
const totalColsClasses = computed(
  (): Record<Cols, string> => ({
    '12': 'lg:grid-cols-12',
  })
);
const gapClasses = computed(
  (): Record<Gap, string> => ({
    '4': 'lg:gap-x-4 gap-y-4',
    '8': 'lg:gap-x-8 gap-y-8',
  })
);
const maxWidthClasses = computed(
  (): Record<MaxWidth, string> => ({
    '3xl': 'max-w-3xl',
  })
);
const colSpanClasses = computed(
  (): Record<ColSpan, string> => ({
    '5': 'col-span-5',
    '6': 'col-span-6',
    '7': 'col-span-7',
  })
);
</script>

<template>
  <div :class="`px-4 lg:px-0 mx-auto ${maxWidthClasses[maxWidth]}`">
    <div
      :class="`grid grid-cols-1 ${totalColsClasses[cols]} gap-x-0 ${gapClasses[gap]}}`"
    >
      <div :class="colSpanClasses[leftSpan]">
        <slot name="left" />
      </div>

      <div :class="colSpanClasses[rightSpan]">
        <slot name="right" />
      </div>

      <slot />
    </div>
  </div>
</template>
