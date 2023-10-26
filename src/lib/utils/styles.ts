import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const justifyVariants = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
};

export const alignItemVariants = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
};

export const ySpacingVariants = {
  none: 'space-y-0',
  xs: 'space-y-1',
  sm: 'space-y-2',
  md: 'space-y-4',
  lg: 'space-y-8',
};

export const xSpacingVariants = {
  none: 'space-x-0',
  sm: 'space-x-2',
  md: 'space-x-4',
  lg: 'space-x-8',
};

export const paddingVariants = {
  none: 'p-0',
  xs: 'p-1',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-8',
};

export const widthVariants = {
  full: 'w-full',
  auto: 'w-auto',
  '2': 'w-2',
  '4': 'w-4',
  '6': 'w-6',
  '8': 'w-8',
  '10': 'w-10',
  '12': 'w-12',
  '14': 'w-14',
  '16': 'w-16',
  '20': 'w-20',
  '24': 'w-24',
  '28': 'w-28',
  '32': 'w-32',
  '36': 'w-36',
  '40': 'w-40',
  '44': 'w-44',
  '48': 'w-48',
  '52': 'w-52',
  '56': 'w-56',
  '60': 'w-60',
  '64': 'w-64',
  '72': 'w-72',
  '80': 'w-80',
  '96': 'w-96',
  px: 'w-px',
};

export const maxWidthVariants = {
  none: 'max-w-none',
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
  min: 'max-w-min',
  max: 'max-w-max',
  prose: 'max-w-prose',
  'screen-sm': 'max-w-screen-sm',
  'screen-md': 'max-w-screen-md',
  'screen-lg': 'max-w-screen-lg',
  'screen-xl': 'max-w-screen-xl',
  'screen-2xl': 'max-w-screen-2xl',
};

export const textSizeVariants = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
  '8xl': 'text-8xl',
  '9xl': 'text-9xl',
};

export const fontFamilyVariants = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
};

export const fontItalicVariant = {
  true: 'italic',
};

export const fontyWeightVariants = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

export const fontNumericVariants = {
  default: 'normal-nums',
  oldstyle: 'oldstyle-nums',
  lining: 'lining-nums',
  tabular: 'tabular-nums',
  proportional: 'proportional-nums',
  diagonal: 'diagonal-fractions',
  stacked: 'stacked-fractions',
  slashed: 'slashed-zero',
  ordinal: 'ordinal',
};

export const lineHeightVariants = {
  none: 'leading-none',
  tight: 'leading-tight',
  snug: 'leading-snug',
  normal: 'leading-normal',
  relaxed: 'leading-relaxed',
  loose: 'leading-loose',
};

export const textAlignVariants = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export const textColorVariants = {
  default: 'text-black',
  primary: 'text-blue-500',
  secondary: 'text-purple-500',
  blue: 'text-blue-500',
};

export const textDecorationVariants = {
  underline: 'underline',
  'line-through': 'line-through',
  'no-underline': 'no-underline',
  overline: 'overline',
};

export const textOverflowVariants = {
  ellipsis: 'overflow-ellipsis',
  clip: 'overflow-clip',
  truncate: 'truncate',
};

export const wordBreakVariants = {
  normal: 'break-normal',
  words: 'break-words',
  all: 'break-all',
  keep: 'break-keep',
};

export const borderRadiusVariants = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

export const shadowVariants = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
  outline: 'shadow-outline',
  none: 'shadow-none',
};
