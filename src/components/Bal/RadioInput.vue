<template>
  <div class="inline-flex items-center">
    <input
      type="radio"
      :value="value"
      :checked="modelValue === value"
      :name="name"
      v-bind="$attrs"
      @change="$emit('update:modelValue', value)"
      :class="['bal-radio-input', inputClasses]"
    >
    <label v-if="$slots.label || label" :for="name" :class="['bal-radio-label', labelClasses]">
      <slot name="label">
        {{ label }}
      </slot>
    </label>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'BalRadioInput',

  emits: ['update:modelValue'],

  props: {
    name: { type: String, required: true },
    value: { type: [String, Number], required: true },
    modelValue: { type: [String, Number], default: '' },
    label: { type: String, default: '' },
    size: {
      type: String,
      default: 'md',
      validator: (val: string): boolean => ['sm', 'md', 'lg'].includes(val)
    },
    color: {
      type: String,
      default: 'blue',
      validator: (val: string): boolean =>
        ['blue'].includes(val)
    }
  },

  setup(props) {
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

    const inputClasses = computed(() => {
      return {
        [sizeClasses.value]: true,
        [colorClasses.value]: true
      }
    })

    const labelClasses = computed(() => {
      return {
        [textSizeClass.value]: true
      }
    })

    return {
      inputClasses,
      labelClasses
    }
  }
});
</script>

<style>
.bal-radio-input {
  @apply bg-white flex-shrink rounded-full cursor-pointer m-0;
  @apply border border-gray-200;
  transition: all ease .25s;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  -webkit-print-color-adjust: exact;
  color-adjust: exact;
  display: inline-block;
  vertical-align: middle;
  background-origin: border-box;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.bal-radio-input:checked {
    background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
    border-color: transparent;
    background-color: currentColor;
    background-size: 100% 100%;
    background-position: center;
    background-repeat: no-repeat;
}

.bal-radio-label {
  @apply ml-2;
}
</style>
