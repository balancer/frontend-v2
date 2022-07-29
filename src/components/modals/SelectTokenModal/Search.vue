<template>
  <div class="flex items-center">
    <BalIcon name="search" size="sm" class="mr-2 text-gray-500" />
    <input
      ref="searchInput"
      :value="modelValue"
      :placeholder="placeholder"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="flex-auto w-full bg-transparent border-0 input"
      @input="handleInput"
    />
  </div>
</template>

<script>
export default {
  props: ['modelValue', 'placeholder'],

  emits: ['update:modelValue'],

  mounted() {
    this.$refs.searchInput.focus();
  },

  methods: {
    handleInput(e) {
      const input = e.target.value;
      this.$emit('update:modelValue', input);
    },
  },
};
</script>
