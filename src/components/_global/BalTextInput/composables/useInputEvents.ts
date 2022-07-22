import { ref } from 'vue';

import { overflowProtected } from '@/components/_global/BalTextInput/helpers';
import { HtmlInputEvent } from '@/types';

/**
 * HELPERS
 */
function blockInvalidChar(event: HtmlInputEvent): void {
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

  function onBlur(event: HtmlInputEvent) {
    emit('blur', event.target.value);
    isActive.value = false;
    if (props.validateOn === 'blur') validate(event.target.value);
  }

  function onInput(event: HtmlInputEvent): void {
    if (props.type === 'number') {
      const overflowProtectedVal = overflowProtected(
        event.target.value,
        props.decimalLimit
      );
      if (overflowProtectedVal !== event.target.value)
        event.target.value = overflowProtectedVal;
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
