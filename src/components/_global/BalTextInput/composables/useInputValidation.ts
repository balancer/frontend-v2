import { computed, ref, watch, watchEffect } from 'vue';

import { RuleFunction } from '@/types';

export default function useInputValidation(props, emit) {
  /**
   * STATE
   */
  const errors = ref<string[]>([]);

  /**
   * COMPUTED
   */
  const isInvalid = computed(() => errors.value.length > 0);

  /**
   * METHODS
   */
  function validate(val: string | number): void {
    errors.value = [];
    props.rules.forEach((rule: RuleFunction) => {
      const result = rule(val);
      if (typeof result === 'string') errors.value.push(result);
    });
  }

  /**
   * WATCHERS
   */
  watchEffect(() => {
    if (props.validateOn === 'input') validate(props.modelValue);
  });

  watch(isInvalid, newVal => {
    emit('update:isValid', !newVal);
  });

  return {
    errors,
    isInvalid,
    validate,
  };
}
