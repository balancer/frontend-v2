<template>
  <div :class="['bal-text-input', wrapperClasses]">
    <div v-if="!!label" class="label">
      {{ label }}
    </div>
    <div :class="['input-group', inputGroupClasses]">
      <div v-if="$slots.prepend" :class="['prepend', prependClasses]">
        <slot name="prepend" />
      </div>
      <div :class="['input-container', inputContainerClasses]">
        <div class="flex flex-col justify-center h-full">
          <input
            :class="[inputClasses]"
            :type="type"
            :name="name"
            :value="modelValue"
            v-bind="$attrs"
            :disabled="disabled"
            @blur="onBlur"
            @input="onInput"
            @keydown="onKeydown"
          />
          <div v-if="$slots.info || info" :class="['info', infoClasses]">
            <slot name="info">
              {{ info }}
            </slot>
          </div>
        </div>
      </div>
      <div v-if="$slots.append" :class="[appendClasses]">
        <div class="flex items-center justify-center h-full">
          <slot name="append" />
        </div>
      </div>
    </div>
    <div v-if="hasError" class="error">
      <div class="relative">
        {{ errors[0] }}
      </div>
    </div>
    <div v-if="fadedOut" class="faded-out-overlay" @click="$emit('click')" />
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  ref,
  computed,
  toRefs,
  PropType,
  watchEffect,
  watch
} from 'vue';
import { Rules, RuleFunction } from '@/types';

export default defineComponent({
  name: 'BalTextInput',

  inheritAttrs: false,

  emits: [
    'input',
    'blur',
    'update:modelValue',
    'update:isValid',
    'click',
    'keydown'
  ],

  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    isValid: {
      type: Boolean,
      default: true
    },
    name: { type: String, required: true },
    label: { type: String, default: '' },
    squareTop: { type: Boolean, default: false },
    noMargin: { type: Boolean, default: false },
    textRight: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    appendBorder: { type: Boolean, default: false },
    prependBorder: { type: Boolean, default: false },
    fadedOut: { type: Boolean, default: false },
    info: { type: String, default: '' },
    decimalLimit: { type: Number, default: 18 },
    type: {
      type: String,
      default: 'text',
      validator: (val: string): boolean => {
        return ['text', 'number', 'date', 'email', 'password'].includes(val);
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

  setup(props, { emit, slots }) {
    const { rules, size, validateOn, noMargin } = toRefs(props);
    const errors = ref([] as Array<string>);

    const hasError = computed(() => errors.value.length > 0);

    function validate(val: string | number): void {
      errors.value = [];
      rules.value.forEach((rule: RuleFunction) => {
        const result = rule(val);
        if (typeof result === 'string') errors.value.push(result);
      });
    }

    function onBlur(event): void {
      emit('blur', event.target.value);
      emit('update:modelValue', event.target.value);
      if (validateOn.value === 'blur') validate(event.target.value);
    }

    function onInput(event): void {
      if (props.type === 'number') {
        const overflowProtectedVal = overflowProtected(event.target.value);
        if (overflowProtectedVal) event.target.value = overflowProtectedVal;
      }
      emit('input', event.target.value);
      emit('update:modelValue', event.target.value);
    }

    function onKeydown(event): void {
      if (props.type === 'number') {
        blockInvalidChar(event);
      }
      emit('keydown', event);
    }

    function blockInvalidChar(event): void {
      ['e', 'E', '+', '-'].includes(event.key) && event.preventDefault();
    }

    function overflowProtected(value: string): string | undefined {
      const [numberStr, decimalStr] = value.toString().split('.');

      if (decimalStr && decimalStr.length > props.decimalLimit) {
        const maxLength = numberStr.length + props.decimalLimit + 1;
        return value.toString().slice(0, maxLength);
      } else return;
    }

    watchEffect(() => {
      if (validateOn.value === 'input') validate(props.modelValue);
    });

    watch(hasError, newVal => {
      emit('update:isValid', !newVal);
    });

    const textSizeClasses = (): string => {
      switch (size.value) {
        case 'sm':
          return 'text-base';
        case 'lg':
          return 'text-lg';
        default:
          return 'text-base';
      }
    };

    const inputHeightClasses = (): string => {
      switch (size.value) {
        case 'sm':
          return 'h-9';
        case 'lg':
          return 'h-18';
        default:
          return 'h-12';
      }
    };

    const wrapperClasses = computed(() => {
      return {
        'mb-5': !noMargin.value
      };
    });

    const inputGroupClasses = computed(() => {
      return {
        'rounded-lg': !props.squareTop,
        'rounded-b-lg': props.squareTop,
        'border-red-500': hasError.value,
        'shadow-inner': !props.disabled
      };
    });

    const inputContainerClasses = computed(() => {
      return {
        [inputHeightClasses()]: true,
        'border-l dark:border-gray-850': slots.prepend && props.prependBorder,
        'border-r dark:border-gray-850': slots.append && props.appendBorder
      };
    });

    const inputClasses = computed(() => {
      return {
        [textSizeClasses()]: true,
        'text-right': props.textRight
      };
    });

    const appendClasses = computed(() => {
      return {
        [textSizeClasses()]: true,
        [inputHeightClasses()]: true,
        ['bg-white dark:bg-gray-900']: props.appendBorder
      };
    });

    const prependClasses = computed(() => {
      return {
        [textSizeClasses()]: true,
        [inputHeightClasses()]: true,
        ['bg-white dark:bg-gray-900']: props.prependBorder
      };
    });

    const infoClasses = computed(() => {
      return {};
    });

    return {
      errors,
      hasError,
      validate,
      onBlur,
      onInput,
      onKeydown,
      wrapperClasses,
      inputGroupClasses,
      inputContainerClasses,
      inputClasses,
      appendClasses,
      prependClasses,
      infoClasses,
      blockInvalidChar
    };
  }
});
</script>

<style scoped>
.bal-text-input {
  @apply relative;
}

input {
  @apply w-full bg-transparent leading-none;
  transition: all 0.3s ease;
  -webkit-appearance: textfield;
  -moz-appearance: textfield;
  appearance: textfield;
}

input:focus {
  outline: none;
}

.label {
  @apply text-primary-300;
}

.input-group {
  @apply flex items-center overflow-hidden bg-white dark:bg-gray-900 border dark:border-0;
}

.input-container {
  @apply px-2 w-full;
}

.prepend {
  @apply px-2;
}

.append {
  @apply px-2;
}

.error {
  @apply absolute text-red-500 text-sm;
}

.info {
  @apply text-gray-500 text-xs;
}

.faded-out-overlay {
  @apply absolute rounded-lg top-0 left-0 opacity-75 w-full h-full bg-white dark:bg-gray-900 z-10 cursor-pointer;
}
</style>
