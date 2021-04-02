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
  watchEffect
} from 'vue';
import { Rules, RuleFunction } from '@/types';

export default defineComponent({
  name: 'BalTextInput',

  inheritAttrs: false,

  emits: ['input', 'blur', 'update:modelValue', 'click'],

  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    name: { type: String, required: true },
    label: { type: String, default: '' },
    noMargin: { type: Boolean, default: false },
    textRight: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    appendBorder: { type: Boolean, default: false },
    prependBorder: { type: Boolean, default: false },
    fadedOut: { type: Boolean, default: false },
    info: { type: String, default: '' },
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
      emit('input', event.target.value);
      emit('update:modelValue', event.target.value);
    }

    watchEffect(() => {
      if (validateOn.value === 'input') validate(props.modelValue);
    });

    const textSizeClasses = (): string => {
      switch (size.value) {
        case 'sm':
          return 'text-sm';
        case 'lg':
          return 'text-lg';
        default:
          return 'text-base';
      }
    };

    const inputHeightClasses = (): string => {
      switch (size.value) {
        case 'sm':
          return 'h-10';
        case 'lg':
          return 'h-18';
        default:
          return 'h-14';
      }
    };

    const wrapperClasses = computed(() => {
      return {
        'mb-5': !noMargin.value
      };
    });

    const inputGroupClasses = computed(() => {
      return {
        'border-red-500': hasError.value
      };
    });

    const inputContainerClasses = computed(() => {
      return {
        [inputHeightClasses()]: true,
        'border-l': slots.prepend && props.prependBorder,
        'border-r': slots.append && props.appendBorder,
        'shadow-inner': !props.disabled
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
        [textSizeClasses()]: true
      };
    });

    const prependClasses = computed(() => {
      return {
        [textSizeClasses()]: true
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
      wrapperClasses,
      inputGroupClasses,
      inputContainerClasses,
      inputClasses,
      appendClasses,
      prependClasses,
      infoClasses
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

.input-group {
  @apply flex items-center overflow-hidden bg-white;
  @apply border rounded-lg;
}

.input-container {
  @apply px-2 w-full;
}

.prepend {
  @apply h-full px-2;
}

.append {
  @apply h-full px-2;
}

.error {
  @apply absolute text-red-500 text-sm;
}

.info {
  @apply text-gray-500 text-xs;
}

.faded-out-overlay {
  @apply absolute top-0 left-0 opacity-75 w-full h-full bg-white z-10 cursor-pointer;
}
</style>
