import { ref } from 'vue';

export default function useInputEvents(props, emit, validate) {
  /**
   * STATE
   */
  const isActive = ref(false);
  const isHover = ref(false);
  /**
   * EVENTS
   */

  function onBlur(event: FocusEvent) {
    if (event.target) {
      const value = (event.target as HTMLInputElement).value;
      emit('blur', value);
      isActive.value = false;
      if (props.validateOn === 'blur') validate(value);
    }
  }

  function onInput(event: Event): void {
    if (event.target) {
      let value = (event.target as HTMLInputElement).value;
      if (props.type === 'number') {
        const overflowProtectedVal = overflowProtected(value);
        if (overflowProtectedVal) value = overflowProtectedVal;
      }
      isActive.value = true;
      emit('input', value);
      emit('update:modelValue', value);
    }
  }

  function onClick(event: MouseEvent) {
    isActive.value = true;
    emit('click', event);
  }

  function onFocus(event: FocusEvent) {
    isActive.value = true;
    emit('focus', event);
  }
  function onMouseOver(event: MouseEvent) {
    isHover.value = true;
    emit('mouseOver', event);
  }
  function onMouseLeave(event: MouseEvent) {
    isHover.value = false;
    emit('mouseLeave', event);
  }

  function onKeydown(event: KeyboardEvent): void {
    if (props.type === 'number') {
      blockInvalidChar(event);
    }
    emit('keydown', event);
  }

  /**
   * HELPERS
   */
  function blockInvalidChar(event: KeyboardEvent): void {
    ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault();
  }

  function overflowProtected(value: string): string | undefined {
    const [numberStr, decimalStr] = value.toString().split('.');

    if (decimalStr && decimalStr.length > props.decimalLimit) {
      const maxLength = numberStr.length + props.decimalLimit + 1;
      return value.toString().slice(0, maxLength);
    } else return;
  }

  return {
    isActive,
    isHover,
    onBlur,
    onInput,
    onKeydown,
    onClick,
    onFocus,
    onMouseOver,
    onMouseLeave,
  };
}
