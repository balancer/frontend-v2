<script lang="ts" setup>
import { VariantProps, cva } from 'class-variance-authority';
import {
  alignItemVariants,
  cn,
  justifyVariants,
  paddingVariants,
  widthVariants,
  xSpacingVariants,
} from '@/lib/utils/styles';

const variants = cva('flex flex-row', {
  variants: {
    justify: justifyVariants,
    align: alignItemVariants,
    spacing: xSpacingVariants,
    padd: paddingVariants,
    width: widthVariants,
  },
});

type Props = VariantProps<typeof variants>;

defineProps<{
  justify?: Props['justify'];
  align?: Props['align'];
  spacing?: Props['spacing'];
  padd?: Props['padd'];
  width?: Props['width'];
}>();
</script>

<template>
  <div :class="cn(variants({ justify, align, spacing, padd, width }))">
    <slot />
  </div>
</template>
