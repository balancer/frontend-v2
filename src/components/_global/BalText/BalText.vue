<script lang="ts" setup>
import {
  cn,
  fontFamilyVariants,
  fontItalicVariant,
  fontNumericVariants,
  fontyWeightVariants,
  lineHeightVariants,
  textAlignVariants,
  textColorVariants,
  textDecorationVariants,
  textOverflowVariants,
  textSizeVariants,
  wordBreakVariants,
} from '@/lib/utils/styles';
import { VariantProps, cva } from 'class-variance-authority';

const variants = cva('', {
  variants: {
    size: textSizeVariants,
    family: fontFamilyVariants,
    italic: fontItalicVariant,
    weight: fontyWeightVariants,
    numeric: fontNumericVariants,
    lineHeight: lineHeightVariants,
    align: textAlignVariants,
    textColor: textColorVariants,
    decoration: textDecorationVariants,
    overflow: textOverflowVariants,
    wordBreak: wordBreakVariants,
  },
});

interface Props extends VariantProps<typeof variants> {
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

withDefaults(
  defineProps<{
    as?: Props['as'];
    size?: Props['size'];
    family?: Props['family'];
    italic?: Props['italic'];
    weight?: Props['weight'];
    numeric?: Props['numeric'];
    lineHeight?: Props['lineHeight'];
    align?: Props['align'];
    textColor?: Props['textColor'];
    decoration?: Props['decoration'];
    overflow?: Props['overflow'];
    wordBreak?: Props['wordBreak'];
  }>(),
  {
    as: 'p',
  }
);
</script>

<template>
  <component
    :is="as"
    :class="
      cn(
        variants({
          size,
          family,
          italic,
          weight,
          numeric,
          lineHeight,
          align,
          textColor,
          decoration,
          overflow,
          wordBreak,
        })
      )
    "
  >
    <slot />
  </component>
</template>
