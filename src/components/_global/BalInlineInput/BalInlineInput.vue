<script lang="ts">
// https://v3.vuejs.org/api/sfc-script-setup.html#usage-alongside-normal-script
export default {
  inheritAttrs: false
};
</script>

<script setup lang="ts">
import { useAttrs, computed, ref } from 'vue';
import { HtmlInputEvent } from '@/types';
import useInputStyles from './composables/useInlineInputStyles';
import useInputEvents from '@/components/_global/BalTextInput/composables/useInputEvents';
import useInputValidation from '@/components/_global/BalTextInput/composables/useInputValidation';
import { omit } from 'lodash';

/**
 * TYPES
 */
type InputValue = string | number;
type InputType = 'text' | 'number' | 'date' | 'email' | 'password';
type InputSize = 'xs' | 'sm' | 'md' | 'lg';
type ValidationTrigger = 'input' | 'blur';
type RuleFunction = (val: InputValue) => string;
export type Rules = RuleFunction[];

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
  rules: () => []
});

const emit = defineEmits<{
  (e: 'blur', value: string): void;
  (e: 'input', value: string): void;
  (e: 'update:modelValue', value: string): void;
  (e: 'update:isValid', value: boolean): void;
  (e: 'keydown', value: HtmlInputEvent);
  (e: 'save'): void;
}>();

/**
 * STATE
 */
const isEditable = ref(false);
const inputElement = ref<HTMLElement>();

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

/**
 * FUNCTIONS
 */
function toggleEditable() {
  isEditable.value = !isEditable.value;
  // if the value was changed to false it means that
  // the user clicked the save icon
  if (isEditable.value === false) emit('save');
  setTimeout(() => {
    if (inputElement.value) {
      inputElement.value.focus();
    }
  }, 200);
}
</script>

<template>
  <div :class="['bal-text-input', parentClasses, borderRadiusClasses]">
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
      <div :class="['input-group', inputGroupClasses]">
        <BalStack horizontal spacing="sm">
          <div v-if="$slots.prepend" :class="['prepend', prependClasses]">
            <slot name="prepend" />
          </div>
          <input
            :type="type"
            :name="name"
            :value="modelValue"
            v-bind="inputAttrs"
            :disabled="!isEditable || disabled"
            @blur="onBlur"
            @input="onInput"
            @keydown="onKeydown"
            :class="['input', inputClasses]"
            ref="inputElement"
          />
          <BalStack horizontal spacing="none" align="center">
            <div v-if="$slots.append" :class="['append', appendClasses]">
              <slot name="append" />
            </div>
            <button
              v-if="!isEditable"
              class="hover:text-blue-500"
              @click="toggleEditable"
            >
              <BalIcon name="edit" size="xs" />
            </button>
            <button v-else class="hover:text-blue-500" @click="toggleEditable">
              <BalIcon name="save" size="xs" />
            </button>
          </BalStack>
        </BalStack>
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

.input {
  @apply flex-grow bg-transparent overflow-hidden;
}

.label {
  @apply text-sm text-gray-500;
}

.error {
  @apply text-xs text-red-500 mt-1 ml-1;
}
</style>
