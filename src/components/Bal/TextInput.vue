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
            :value="$attrs.modelValue"
            v-bind="$attrs"
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
    <div v-if="hasError" :class="['error']">
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
    textRight: { type: Boolean, default: false },
    info: { type: String, default: '' },
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

  setup(props, { emit, slots, attrs }) {
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
          return 'h-8';
        case 'lg':
          return 'h-16';
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
        'border-red-500': hasError.value
      };
    });

    const inputContainerClasses = computed(() => {
      return {
        [inputHeightClasses()]: true,
        'border-l': slots.prepend,
        'border-r': slots.append,
        'shadow-inner': !attrs.disabled
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
  @apply flex items-center overflow-hidden bg-transparent;
  @apply border rounded;
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
</style>
