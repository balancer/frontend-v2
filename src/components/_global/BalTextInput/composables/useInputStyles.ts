import { computed, Ref } from 'vue';

export default function useInputStyles(
  props,
  isInvalid: Ref<boolean>,
  isActive: Ref<boolean>,
  isHover: Ref<boolean>,
  attrs
) {
  const extPaddingClass = (): string => {
    switch (props.size) {
      case 'xs':
        return 'p-1';
      case 'sm':
        return 'p-1';
      case 'lg':
        return 'p-3';
      default:
        return 'p-2';
    }
  };

  const intPaddingClass = (): string => {
    switch (props.size) {
      case 'xs':
        return 'p-px';
      case 'sm':
        return 'p-px';
      case 'lg':
        return 'p-2';
      default:
        return 'p-1';
    }
  };

  const inputTextSize = (): string => {
    switch (props.size) {
      case 'xs':
        return 'text-base';
      case 'sm':
        return 'text-base';
      case 'lg':
        return 'text-2xl';
      default:
        return 'text-xl';
    }
  };

  const inputHeightClass = (): string => {
    switch (props.size) {
      case 'xs':
        return 'h-6';
      case 'sm':
        return 'h-8';
      case 'lg':
        return 'h-12';
      default:
        return 'h-10';
    }
  };

  const parentClasses = computed(() => ({
    [attrs.class]: true,
    'rounded-lg': !props.noShadow,
    'shadow-lg': !props.noShadow && !props.disabled,
  }));

  const inputContainerClasses = computed(() => ({
    'bg-white dark:bg-gray-800': !props.disabled,
    'bg-gray-100 dark:bg-gray-800': props.disabled,
    [extPaddingClass()]: true,
    border: !props.noBorder,
    'border-gray-100 dark:border-gray-800': !isInvalid.value && !isActive.value,
    'border-red-500 dark:border-red-500': isInvalid.value,
    'border-blue-300 dark:border-blue-400': isActive.value && !isInvalid.value,
    'hover:border-gray-300 dark:hover:border-gray-700':
      isHover.value && !isActive.value && !props.disabled,
    'shadow-inner': !props.noShadow && !props.disabled,
  }));

  const inputGroupClasses = computed(() => ({
    [intPaddingClass()]: true,
  }));

  const headerClasses = computed(() => ({
    [intPaddingClass()]: true,
  }));

  const footerClasses = computed(() => ({
    [intPaddingClass()]: true,
  }));

  const inputClasses = computed(() => ({
    [inputHeightClass()]: true,
    [inputTextSize()]: true,
    'text-right': props.inputAlignRight,
    'font-numeric': props.type === 'number',
    'text-red-500': isInvalid.value,
    'cursor-not-allowed': props.disabled,
  }));

  const prependClasses = computed(() => ({
    [inputHeightClass()]: true,
  }));

  const appendClasses = computed(() => ({
    [inputHeightClass()]: true,
  }));

  const borderRadiusClasses = computed(() => ({
    'rounded-lg': !props.noRadius,
  }));

  return {
    parentClasses,
    inputContainerClasses,
    inputGroupClasses,
    headerClasses,
    footerClasses,
    inputClasses,
    prependClasses,
    appendClasses,
    borderRadiusClasses,
  };
}
