<template>
  <div :class="['bal-text-input', wrapperClasses]">
    <div v-if="!!label" class="label">
      {{ label }}
    </div>
    <div :class="['input-container', containerClasses]">
      <div v-if="$slots.prepend" :class="[prependClasses]">
        <div class="flex items-center justify-center h-full">
          <slot name="prepend" />
        </div>
      </div>
      <div class="flex-1">
        <input
          :class="[inputClasses]"
          :type="type"
          :name="name"
          v-model="$attrs.modelValue"
          v-bind="$attrs"
          @blur="onBlur"
          @input="onInput"
        />
      </div>
      <div v-if="$slots.append" :class="[appendClasses]">
        <div class="flex items-center justify-center h-full">
          <slot name="append" />
        </div>
      </div>
    </div>
    <div v-if="hasError" :class="['error', errorClasses]">
      <div class="relative">
        {{ errors[0] }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRefs, PropType } from 'vue';
import { Rules, RuleFunction } from '@/types';

export default defineComponent({
  name: 'BalTextInput',

  inheritAttrs: false,

  emits: ['input', 'blur', 'update:modelValue'],

  props: {
    name: { type: String, required: true },
    label: { type: String, default: '' },
    noMargin: { type: Boolean, default: false },
    type: {
      type: String,
      default: 'text',
      validator: (val: string): boolean => {
        return ['text', 'number', 'date'].includes(val);
      }
    },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val)
    },
    validateOn: {
      type: String,
      default: 'blur',
      validator: (val: string): boolean => ['blur', 'input'].includes(val)
    },
    rules: {
      type: Array as PropType<Rules>,
      default: () => []
    }
  },

  setup(props, { emit }) {
    const { rules, size, validateOn, noMargin } = toRefs(props);
    const errors = ref([] as Array<string>);

    const hasError = computed(() => errors.value.length > 0);

    function validate(val: string): void {
      errors.value = [];
      rules.value.forEach((rule: RuleFunction) => {
        const result = rule(val);
        if (typeof result === 'string') errors.value.push(result);
      });
    }

    function onBlur(event): void {
      emit('blur');
      emit('update:modelValue', event.target.value);
      if (validateOn.value === 'blur') validate(event.target.value);
    }

    function onInput(event): void {
      emit('input', event.target.value);
      emit('update:modelValue', event.target.value);
      if (validateOn.value === 'input') validate(event.target.value);
    }

    const sizeClasses = (): string => {
      switch (size.value) {
        case 'sm':
          return 'h-8 px-2 text-sm';
        case 'lg':
          return 'h-16 px-2 text-lg';
        default:
          return 'h-12 px-2';
      }
    };

    const wrapperClasses = computed(() => {
      return {
        'mb-5': !noMargin.value
      };
    });

    const containerClasses = computed(() => {
      return {
        'border-red-500': hasError.value
      };
    });

    const inputClasses = computed(() => {
      return {
        [sizeClasses()]: true
      };
    });

    const appendClasses = computed(() => {
      return {
        [sizeClasses()]: true
      };
    });

    const prependClasses = computed(() => {
      return {
        [sizeClasses()]: true
      };
    });

    return {
      errors,
      hasError,
      validate,
      onBlur,
      onInput,
      wrapperClasses,
      containerClasses,
      inputClasses,
      appendClasses,
      prependClasses
    };
  }
});
</script>

<style scoped>
input {
  @apply w-full bg-transparent leading-none;
  transition: all 0.3s ease;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

input:focus {
  outline: none;
}

.label {
  @apply text-primary-300;
}

.input-container {
  @apply flex overflow-hidden bg-transparent;
  @apply border rounded px-2;
}

.error {
  @apply absolute text-red-500 text-sm;
}
</style>
