import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
/**
 * HELPERS
 */
function blockInvalidChar(event: KeyboardEvent): void {
  ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault();
}

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
        const overflowProtectedVal = overflowProtected(
          value,
          props.decimalLimit
        );
        if (overflowProtectedVal !== value) value = overflowProtectedVal;
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
