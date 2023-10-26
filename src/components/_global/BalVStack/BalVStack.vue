<script lang="ts" setup>
import { VariantProps, cva } from 'class-variance-authority';
import {
  alignItemVariants,
  cn,
  justifyVariants,
  maxWidthVariants,
  paddingVariants,
  widthVariants,
  ySpacingVariants,
} from '@/lib/utils/styles';

const variants = cva('flex flex-col', {
  variants: {
    justify: justifyVariants,
    align: alignItemVariants,
    spacing: ySpacingVariants,
    padd: paddingVariants,
    width: widthVariants,
    maxWidth: maxWidthVariants,
  },
});

type Props = VariantProps<typeof variants>;

defineProps<{
  justify?: Props['justify'];
  align?: Props['align'];
  spacing?: Props['spacing'];
  padd?: Props['padd'];
  width?: Props['width'];
  maxWidth?: Props['maxWidth'];
}>();
</script>

<template>
  <div
    :class="cn(variants({ justify, align, spacing, padd, width, maxWidth }))"
  >
    <slot />
  </div>
</template>
