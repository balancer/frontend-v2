<script lang="ts">
// https://v3.vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { useAttrs, computed } from 'vue';
import { HtmlInputEvent } from '@/types';
import useInputStyles from './composables/useInputStyles';
import useInputEvents from './composables/useInputEvents';
import useInputValidation from './composables/useInputValidation';
import { omit } from 'lodash';
import BalTooltip from '@/components/_global/BalTooltip/BalTooltip.vue';

/**
 * TYPES
 */
type InputValue = string | number;
type InputType =
  | 'text'
  | 'number'
  | 'date'
  | 'email'
  | 'password'
  | 'textarea'
  | 'time';
type InputSize = 'xs' | 'sm' | 'md' | 'lg';
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
  title?: string;
  tooltip?: string;
  inputAlignRight?: boolean;
  decimalLimit?: number;
  validateOn?: ValidationTrigger;
  rules?: Rules;
  noRadius?: boolean;
  noShadow?: boolean;
  noBorder?: boolean;
  format?: (input: string | number) => string | number;
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
  rules: () => [],
  noRadius: false,
  noShadow: false,
  noBorder: false
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
const attrs = useAttrs();
const { errors, isInvalid, validate } = useInputValidation(props, emit);
const {
  parentClasses,
  inputContainerClasses,
  inputGroupClasses,
  headerClasses,
  footerClasses,
  inputClasses,
  prependClasses,
  appendClasses,
  borderRadiusClasses
} = useInputStyles(props, isInvalid, attrs);
const { onInput, onKeydown, onBlur } = useInputEvents(props, emit, validate);

/**
 * COMPUTED
 */

// We don't want to pass on parent level classes to the html
// input element. So we need to remove it from the attrs object.
const inputAttrs = computed(() => omit(attrs, 'class'));
</script>

<template>
  <div :class="['bal-text-input', parentClasses, borderRadiusClasses]">
    <div v-if="title" class="mb-1">
      {{ title }}
      <BalTooltip v-if="tooltip">
        <template v-slot:activator>
          <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
        </template>
        <div v-html="tooltip" />
      </BalTooltip>
    </div>
    <div
      :class="['input-container', inputContainerClasses, borderRadiusClasses]"
    >
      <div v-if="$slots.header || label" :class="['header', headerClasses]">
        <slot name="header">
          <span class="label">
            {{ label }}
          </span>
        </slot>
      </div>
      <div :class="['input-group', 'relative', inputGroupClasses]">
        <div v-if="$slots.prepend" :class="['prepend', prependClasses]">
          <slot name="prepend" />
        </div>
        <div class="middle">
          <textarea
            v-if="type === 'textarea'"
            :value="modelValue"
            v-bind="inputAttrs"
            :disabled="disabled"
            @blur="onBlur"
            @input="onInput"
            @keydown="onKeydown"
            :class="['input', inputClasses, 'h-48']"
          />
          <input
            v-else
            :type="type"
            :name="name"
            :value="modelValue"
            v-bind="inputAttrs"
            :disabled="disabled"
            @blur="onBlur"
            @input="onInput"
            @keydown="onKeydown"
            :class="['input', inputClasses]"
          />

          <div v-if="$slots.info" class="info absolute -bottom-1.5">
            <slot name="info">
              {{ info }}
            </slot>
          </div>
        </div>

        <div v-if="$slots.append" :class="['append', appendClasses]">
          <slot name="append" />
        </div>
      </div>
      <div v-if="$slots.footer" :class="['footer', footerClasses]">
        <slot name="footer" />
      </div>
      <div v-if="isInvalid" :class="['error']">
        {{ errors[0] }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-container {
  @apply bg-white dark:bg-gray-800;
}

.input-group {
  @apply flex;
}

.middle {
  @apply flex-grow;
}

.input {
  @apply bg-transparent overflow-hidden w-full;
}

.label {
  @apply text-sm text-gray-500;
}

.error {
  @apply text-xs text-red-500 mt-1 ml-1;
}

.info {
  @apply text-gray-500 text-xs;
}
</style>
