import { ref } from 'vue';

import { HtmlInputEvent } from '@/types';

export default function useInputEvents(props, emit, validate) {
  /**
   * STATE
   */
  const isActive = ref(false);
  const isHover = ref(false);
  /**
   * EVENTS
   */

  function onBlur(event: HtmlInputEvent) {
    emit('blur', event.target.value);
    isActive.value = false;
    if (props.validateOn === 'blur') validate(event.target.value);
  }

  function onInput(event: HtmlInputEvent): void {
    if (props.type === 'number') {
      const overflowProtectedVal = overflowProtected(event.target.value);
      if (overflowProtectedVal) event.target.value = overflowProtectedVal;
    }
    isActive.value = true;
    emit('input', event.target.value);
    emit('update:modelValue', event.target.value);
  }

  function onClick(event: HtmlInputEvent) {
    isActive.value = true;
    emit('click', event);
  }

  function onFocus(event: HtmlInputEvent) {
    isActive.value = true;
    emit('focus', event);
  }
  function onMouseOver(event: HtmlInputEvent) {
    isHover.value = true;
    emit('mouseOver', event);
  }
  function onMouseLeave(event: HtmlInputEvent) {
    isHover.value = false;
    emit('mouseLeave', event);
  }

  function onKeydown(event: HtmlInputEvent): void {
    if (props.type === 'number') {
      blockInvalidChar(event);
    }
    emit('keydown', event);
  }

  /**
   * HELPERS
   */
  function blockInvalidChar(event: HtmlInputEvent): void {
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
    onMouseLeave
  };
}
