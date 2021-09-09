import { Ref, computed } from 'vue';

export default function useInputStyles(props, isInvalid: Ref<boolean>, attrs) {
  const extPaddingClass = (): string => {
    switch (props.size) {
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
      case 'sm':
        return 'h-8';
      case 'lg':
        return 'h-12';
      default:
        return 'h-10';
    }
  };

  const parentClasses = computed(() => attrs.class);

  const inputContainerClasses = computed(() => ({
    'border border-gray-100 dark:border-gray-700': true,
    [extPaddingClass()]: true,
    'border-red-500 dark:border-red-500': isInvalid.value
  }));

  const inputGroupClasses = {
    [intPaddingClass()]: true
  };

  const headerClasses = {
    [intPaddingClass()]: true
  };

  const footerClasses = {
    [intPaddingClass()]: true
  };

  const inputClasses = {
    [inputHeightClass()]: true,
    [inputTextSize()]: true,
    'text-right': props.inputAlignRight
  };

  const prependClasses = {
    [inputHeightClass()]: true
  };

  const appendClasses = {
    [inputHeightClass()]: true
  };

  return {
    parentClasses,
    inputContainerClasses,
    inputGroupClasses,
    headerClasses,
    footerClasses,
    inputClasses,
    prependClasses,
    appendClasses
  };
}
