<template>
  <div class="bal-toggle" @click="onClick">
    <input
      type="checkbox"
      :name="name"
      :checked="modelValue"
      v-bind="$attrs"
      class="bal-toggle-checkbox"
    />
    <label for="toggle" class="bal-toggle-label"></label>
  </div>
  <label for="toggle" class="text-xs text-gray-700">
    {{ label }}
  </label>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BalToggle',

  inheritAttrs: false,

  emits: ['update:modelValue', 'toggle'],

  props: {
    name: { type: String, required: true },
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: '' },
    color: {
      type: String,
      default: 'green',
      validator: (val: string): boolean => ['green'].includes(val)
    }
  },

  setup(_, { emit }) {
    function onClick(event) {
      emit('update:modelValue', event.target.checked);
      emit('toggle', event.target.checked);
    }

    return { onClick };
  }
});
</script>

<style>
.bal-toggle {
  @apply relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in;
}

.bal-toggle-checkbox {
  @apply absolute block w-6 h-6 rounded-full bg-white border-4 border-gray-200 appearance-none cursor-pointer;
}

.bal-toggle-label {
  @apply block overflow-hidden h-6 rounded-full bg-gray-200 cursor-pointer;
}

.bal-toggle-checkbox:checked {
  @apply right-0 border-green-400;
}

.bal-toggle-checkbox:checked + .bal-toggle-label {
  @apply bg-green-400;
}
</style>
