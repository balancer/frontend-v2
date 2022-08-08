<template>
  <form
    :action="action"
    :method="method"
    v-bind="$attrs"
    @submit.prevent="$emit('onSubmit')"
  >
    <slot />
  </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

function useFormValidations() {
  const errors = ref([] as Array<string>);
  const validatable = ref([] as Array<any>);

  function handleInputErrors(_errors: Array<string>) {
    if (_errors && _errors.length > 0) {
      errors.value.push(..._errors);
    }
  }

  function validateInput(input) {
    input.validate(input.$props.modelValue);
    handleInputErrors(input.errors);
  }

  function findValidatable(children): void {
    children.forEach(child => {
      if (
        child.component &&
        typeof child.component.proxy.validate === 'function'
      ) {
        validatable.value.push(child.component.proxy);
      }
      if (Array.isArray(child.children)) {
        findValidatable(child.children);
      }
    });
  }

  function validate(this: any) {
    errors.value = [];
    validatable.value = [];

    findValidatable(this.$.subTree.children);
    validatable.value.forEach(input => validateInput(input));

    if (errors.value.length > 0) return false;
    return true;
  }

  return {
    errors,
    validate,
    validateInput,
  };
}

export default defineComponent({
  name: 'BalForm',

  props: {
    action: { type: String, default: '' },
    method: { type: String, default: 'post' },
  },

  emits: ['onSubmit'],

  setup() {
    const { errors, validate, validateInput } = useFormValidations();
    return { errors, validate, validateInput };
  },
});
</script>
