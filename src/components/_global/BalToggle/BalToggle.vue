<template>
  <div class="group bal-toggle" @click="onClick">
    <input
      type="checkbox"
      :name="name"
      :checked="modelValue"
      v-bind="$attrs"
      :disabled="disabled"
      class="bal-toggle-checkbox"
    />
    <label :for="name" class="bal-toggle-track" />
  </div>
  <label v-if="label" class="ml-2 text-xs dark:text-white">
    {{ label }}
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'BalToggle',
  inheritAttrs: false,
  props: {
    name: { type: String, required: true },
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    color: {
      type: String,
      default: 'green',
      validator: (val: string): boolean => ['green'].includes(val),
    },
  },
  emits: ['update:modelValue', 'toggle'],
  setup(props, { emit }) {
    /**
     * METHODS
     */
    function onClick(event) {
      if (!props.disabled) {
        emit('update:modelValue', event.target.checked);
        emit('toggle', event.target.checked);
      }
    }
    return {
      // methods
      onClick,
    };
  },
});
</script>

<style>
.bal-toggle {
  @apply relative inline-block w-10 align-middle select-none transition duration-200 ease-out;
}

.bal-toggle-checkbox {
  @apply absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-200 group-hover:border-gray-300
    dark:border-gray-700 dark:group-hover:border-gray-900 appearance-none cursor-pointer transition-colors;
}

.bal-toggle-track {
  @apply block overflow-hidden h-6 rounded-full bg-gray-200 group-hover:bg-gray-300 dark:bg-gray-700
    dark:group-hover:bg-gray-900 bg-none cursor-pointer transition-colors;
}

.bal-toggle-checkbox:checked {
  @apply right-0 border-green-400 group-hover:border-green-500 dark:border-green-500
    dark:group-hover:border-green-400 transition-colors;
}

.bal-toggle-track[for='tradeGasless'] {
  @apply h-8;
}

.bal-toggle-checkbox[name='tradeGasless'] {
  @apply w-8 h-8 flex items-center justify-center;
}

.bal-toggle-checkbox[name='tradeGasless']::before {
  content: '⛽';
}

.bal-toggle-checkbox[name='tradeGasless']:checked::before {
  content: '✍️';
}

.bal-toggle-checkbox:checked + .bal-toggle-track {
  @apply bg-green-400 group-hover:bg-green-500 dark:bg-green-500 dark:group-hover:bg-green-400;
}

.bal-toggle-checkbox[disabled] {
  @apply border-gray-300 dark:border-gray-700 cursor-not-allowed;
}

.bal-toggle-checkbox[disabled] + .bal-toggle-track {
  @apply bg-gray-300 dark:bg-gray-700 cursor-not-allowed;
}
</style>
