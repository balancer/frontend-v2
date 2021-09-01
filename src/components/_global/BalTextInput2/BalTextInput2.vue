<script lang="ts">
// https://v3.vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { HtmlInputEvent } from '@/types';
import useInputStyles from './composables/useInputStyles';
import useInputEvents from './composables/useInputEvents';
import useInputValidation from './composables/useInputValidation';

/**
 * TYPES
 */
type InputValue = string | number;
type InputType = 'text' | 'number' | 'date' | 'email' | 'password';
type InputSize = 'sm' | 'md' | 'lg';
type ValidationTrigger = 'input' | 'blur';
type RuleFunction = (val: InputValue) => string;
type Rules = RuleFunction[];

type Props = {
  name: string;
  modelValue: InputValue;
  isValid?: boolean;
  type?: InputType;
  size?: InputSize;
  disabled?: boolean;
  label?: string;
  inputAlignRight?: boolean;
  decimalLimit?: number;
  validateOn?: ValidationTrigger;
  rules?: Rules;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  modelValue: '',
  isValid: true,
  size: 'md',
  disabled: false,
  inputAlignRight: false,
  decimalLimit: 18,
  validateOn: 'blur',
  rules: () => []
});

const emit = defineEmits<{
  (e: 'blur', value: string): void;
  (e: 'input', value: string): void;
  (e: 'update:modelValue', value: string): void;
  (e: 'update:isValid', value: boolean): void;
  (e: 'keydown', value: HtmlInputEvent);
}>();

/**
 * COMPOSABLES
 */
const { errors, isInvalid, validate } = useInputValidation(props, emit);
const {
  inputContainerClasses,
  inputGroupClasses,
  headerClasses,
  footerClasses,
  inputClasses,
  prependClasses,
  appendClasses
} = useInputStyles(props, isInvalid);
const { onInput, onKeydown, onBlur } = useInputEvents(props, emit, validate);
</script>

<template>
  <div class="bal-text-input">
    <div :class="['input-container', inputContainerClasses]">
      <div v-if="$slots.header || label" :class="['header', headerClasses]">
        <slot name="header">
          <span class="label">
            {{ label }}
          </span>
        </slot>
      </div>
      <div :class="['input-group', inputGroupClasses]">
        <div v-if="$slots.prepend" :class="['prepend', prependClasses]">
          <slot name="prepend" />
        </div>
        <input
          :type="type"
          :name="name"
          :value="modelValue"
          v-bind="$attrs"
          :disabled="disabled"
          @blur="onBlur"
          @input="onInput"
          @keydown="onKeydown"
          :class="['input', inputClasses]"
        />
        <div v-if="$slots.append" :class="['append', appendClasses]">
          <slot name="append" />
        </div>
      </div>
      <div v-if="$slots.footer" :class="['footer', footerClasses]">
        <slot name="footer" />
      </div>
    </div>
  </div>
  <div v-if="isInvalid" :class="['error']">
    {{ errors[0] }}
  </div>
</template>

<style scoped>
.bal-text-input {
  @apply shadow-lg rounded-lg;
}

.input-container {
  @apply shadow-inner rounded-lg bg-white dark:bg-gray-800;
}

.input-group {
  @apply flex;
}

.input {
  @apply flex-grow bg-transparent;
}

.label {
  @apply text-sm text-gray-500;
}

.error {
  @apply text-sm text-red-500 mt-1;
}
</style>
