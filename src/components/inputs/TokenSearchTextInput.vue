<script setup lang="ts">
type Props = {
  modelValue: string;
  placeholder: string;
};
/**
 * PROPS & EMITS
 */
withDefaults(defineProps<Props>(), {});
const emit = defineEmits(['update:modelValue']);

function handleInput(e) {
  emit('update:modelValue', e.target.value);
}
</script>

<template>
  <div
    class="flex flex-wrap items-center pl-4 h-11 dark:text-gray-100 dark:bg-gray-800 rounded-lg border-2"
  >
    <BalIcon name="search" size="lg" class="mr-4" />
    <div class="flex flex-wrap gap-2 items-center">
      <input
        class="dark:bg-gray-800"
        :value="modelValue"
        type="text"
        :placeholder="placeholder"
        @input="handleInput"
      />
    </div>
  </div>
</template>

