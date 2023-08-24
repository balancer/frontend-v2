<script lang="ts" setup>
import { VariantProps, cva } from 'class-variance-authority';
import { cn } from '@/lib/utils/styles';

const variants = cva('flex flex-row items-center font-medium rounded-full', {
  variants: {
    color: {
      blue: 'bg-blue-50 border border-blue-200 text-blue-500',
    },
    size: {
      md: 'shadow-sm text-sm py-1 px-2 space-x-1',
    },
  },
  defaultVariants: {
    color: 'blue',
    size: 'md',
  },
});

type TagVariantProps = VariantProps<typeof variants>;

withDefaults(
  defineProps<{
    color?: TagVariantProps['color'];
    size?: TagVariantProps['size'];
    closeable?: boolean;
    iconSize?: 'xs' | 'sm' | 'md' | 'lg';
  }>(),
  {
    iconSize: 'xs',
  }
);

const emit = defineEmits(['closed']);
</script>

<template>
  <BalHStack :class="cn(variants({ color, size }))">
    <slot />
    <BalIcon
      v-if="closeable"
      name="x"
      :size="iconSize"
      class="cursor-pointer"
      @click="emit('closed')"
    />
  </BalHStack>
</template>
