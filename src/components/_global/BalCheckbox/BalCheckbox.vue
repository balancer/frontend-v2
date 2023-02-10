<template>
  <div :class="['bal-checkbox', wrapperClasses]">
    <div class="flex">
      <div :class="['flex', alignCheckbox]">
        <input
          type="checkbox"
          :name="name"
          :checked="modelValue"
          :class="[
            'bal-checkbox-input hover:border-blue-600 dark:hover:border-blue-400 cursor-pointer transition-colors',
            alignCheckbox === 'items-start' && 'relative top-2',
            inputClasses,
          ]"
          @change="onChange"
        />
      </div>
      <div class="relative flex-col ml-3">
        <label
          v-if="$slots.label || label"
          :for="name"
          :class="['bal-checkbox-label', labelClasses]"
        >
          <slot name="label">
            {{ label }}
          </slot>
        </label>
        <div v-if="hasError" class="font-medium bal-checkbox-error">
          <div class="relative">
            {{ errors[0] }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType } from 'vue';

import { RuleFunction, Rules } from '@/types';

export default defineComponent({
  name: 'BalCheckbox',

  props: {
    name: { type: String, required: true },
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: '' },
    noMargin: { type: Boolean, default: false },
    alignCheckbox: { type: String, default: 'items-start' },
    rules: {
      type: Array as PropType<Rules>,
      default: () => [],
    },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val),
    },
    color: {
      type: String,
      default: 'blue',
      validator: (val: string): boolean => ['blue'].includes(val),
    },
  },

  emits: ['update:modelValue'],

  setup(props, { emit }) {
    const errors = ref([] as Array<string>);

    const hasError = computed(() => errors.value.length > 0);

    function validate(val: string | number): void {
      errors.value = [];
      props.rules.forEach((rule: RuleFunction) => {
        const result = rule(val);
        if (typeof result === 'string') errors.value.push(result);
      });
    }

    function onChange(event) {
      emit('update:modelValue', event.target.checked);
      validate(event.target.checked);
    }

    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-4 h-4 -mt-px';
        case 'lg':
          return 'w-6 h-6';
        default:
          return `w-5 h-5 ${
            props.alignCheckbox === 'items-start' ? 'mt-1' : ''
          }`;
      }
    });

    const textSizeClass = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'text-sm';
        case 'lg':
          return 'text-lg';
        default:
          return 'text-base';
      }
    });

    const colorClasses = computed(() => {
      return `text-${props.color}-500`;
    });

    const wrapperClasses = computed(() => {
      return {
        'mb-1': !props.noMargin,
      };
    });

    const inputClasses = computed(() => {
      return {
        [sizeClasses.value]: true,
        [colorClasses.value]: true,
      };
    });

    const labelClasses = computed(() => {
      return {
        [textSizeClass.value]: true,
      };
    });

    return {
      wrapperClasses,
      inputClasses,
      labelClasses,
      validate,
      hasError,
      errors,
      onChange,
    };
  },
});
</script>

<style>
.bal-checkbox {
  @apply relative;
}

.bal-checkbox-input {
  @apply text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600
    rounded leading-none;

  appearance: none;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  vertical-align: middle;
  background-origin: border-box;
  user-select: none;
}

.bal-checkbox-input:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M5.707 7.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L7 8.586 5.707 7.293z'/%3e%3c/svg%3e");
  border-color: transparent;
  background-color: currentcolor;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.bal-checkbox-error {
  @apply text-red-500 text-sm pt-1;
}
</style>
