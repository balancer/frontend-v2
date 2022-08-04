import { computed, Ref } from 'vue';

export default function useInputStyles(props, isInvalid: Ref<boolean>, attrs) {
  const extPaddingClass = (): string => {
    switch (props.size) {
      case 'xs':
        return 'p-0';
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
        return 'text-sm';
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

  const parentClasses = computed(() => attrs.class);

  const inputContainerClasses = computed(() => ({
    [extPaddingClass()]: true,
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
