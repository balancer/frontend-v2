<script lang="ts" setup>
import { VariantProps, cva } from 'class-variance-authority';
import {
  alignItemVariants,
  borderRadiusVariants,
  cn,
  justifyVariants,
  paddingVariants,
  textSizeVariants,
  xSpacingVariants,
  shadowVariants,
  fontyWeightVariants,
} from '@/lib/utils/styles';
import { textColorVariants } from '@/lib/utils/styles';

const variants = cva('flex flex-row', {
  variants: {
    color: {
      blue: 'bg-blue-50 border border-blue-200',
    },
    justify: justifyVariants,
    align: alignItemVariants,
    spacing: xSpacingVariants,
    padd: paddingVariants,
    textSize: textSizeVariants,
    radius: borderRadiusVariants,
    textColor: textColorVariants,
    shadow: shadowVariants,
    fontWeight: fontyWeightVariants,
  },
  defaultVariants: {
    color: 'blue',
    spacing: 'sm',
    padd: 'xs',
    align: 'center',
    textSize: 'sm',
    radius: 'full',
    textColor: 'blue',
    shadow: 'sm',
    fontWeight: 'medium',
  },
});

type TagVariantProps = VariantProps<typeof variants>;

withDefaults(
  defineProps<{
    justify?: TagVariantProps['justify'];
    align?: TagVariantProps['align'];
    spacing?: TagVariantProps['spacing'];
    padd?: TagVariantProps['padd'];
    textSize?: TagVariantProps['textSize'];
    color?: TagVariantProps['color'];
    textColor?: TagVariantProps['textColor'];
    radius?: TagVariantProps['radius'];
    shadow?: TagVariantProps['shadow'];
    fontWeight?: TagVariantProps['fontWeight'];
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
  <BalHStack
    :class="
      cn(
        variants({
          justify,
          align,
          spacing,
          padd,
          textSize,
          color,
          textColor,
          shadow,
          radius,
          fontWeight,
        })
      )
    "
  >
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
