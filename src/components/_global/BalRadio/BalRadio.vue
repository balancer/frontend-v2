<template>
  <div class="inline-flex items-start">
    <input
      type="radio"
      :value="value"
      :checked="modelValue === value"
      :name="name"
      :class="['bal-radio-input', inputClasses]"
      :disabled="disabled"
      @change="onChange(value)"
    />
    <label
      v-if="$slots.label || label"
      :for="name"
      :class="['bal-radio-label', labelClasses]"
      @click.prevent="onChange(value)"
    >
      <slot name="label">
        {{ label }}
      </slot>
    </label>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'BalRadio',

  props: {
    name: { type: String, required: true },
    value: { type: [String, Number], required: true },
    modelValue: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
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
    function onChange(value) {
      if (!props.disabled) emit('update:modelValue', value);
    }

    const sizeClasses = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'w-3 h-3';
        case 'lg':
          return 'w-6 h-6';
        default:
          return 'w-4 h-4';
      }
    });

    const textSizeClass = computed(() => {
      switch (props.size) {
        case 'sm':
          return 'leading-none text-sm';
        case 'lg':
          return 'leading-none text-lg';
        default:
          return 'leading-none text-base';
      }
    });

    const colorClass = computed(() => {
      if (props.disabled) return 'text-gray-500';
      return `text-${props.color}-500`;
    });

    const cursrorClass = computed(() => {
      if (props.disabled) return 'cursor-not-allowed';
      return 'cursor-pointer';
    });

    const inputClasses = computed(() => {
      return {
        [sizeClasses.value]: true,
        [colorClass.value]: true,
        [cursrorClass.value]: true,
      };
    });

    const labelClasses = computed(() => {
      return {
        [textSizeClass.value]: true,
        [cursrorClass.value]: true,
      };
    });

    return {
      onChange,
      inputClasses,
      labelClasses,
    };
  },
});
</script>

<style>
.bal-radio-input {
  @apply bg-white dark:bg-gray-900 rounded-full m-0;
  @apply border border-gray-300 dark:border-gray-900;

  transition: all ease 0.25s;
  appearance: none;
  -webkit-print-color-adjust: exact;
  color-adjust: exact;
  display: inline-block;
  vertical-align: middle;
  background-origin: border-box;
  user-select: none;
}

.bal-radio-input:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
  border-color: transparent;
  background-color: currentcolor;
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}

.bal-radio-label {
  @apply ml-2 flex-1;
}
</style>
