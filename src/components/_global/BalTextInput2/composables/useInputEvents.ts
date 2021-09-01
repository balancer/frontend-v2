import { HtmlInputEvent } from '@/types';

export default function useInputEvents(props, emit, validate) {
  /**
   * EVENTS
   */
  function onBlur(event: HtmlInputEvent) {
    emit('blur', event.target.value);
    if (props.validateOn === 'blur') validate(event.target.value);
  }

  function onInput(event: HtmlInputEvent): void {
    if (props.type === 'number') {
      const overflowProtectedVal = overflowProtected(event.target.value);
      if (overflowProtectedVal) event.target.value = overflowProtectedVal;
    }
    emit('input', event.target.value);
    emit('update:modelValue', event.target.value);
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
    onBlur,
    onInput,
    onKeydown
  };
}
