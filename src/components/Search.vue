<template>
  <div class="flex items-center">
    <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      ref="searchInput"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="border-0 input flex-auto w-full"
    />
  </div>
</template>

<script>
export default {
  props: ['modelValue', 'placeholder'],
  emits: ['update:modelValue'],
  methods: {
    handleInput(e) {
      const input = e.target.value;
      this.$emit('update:modelValue', input);
    }
  },
  mounted() {
    this.$refs.searchInput.focus();
  }
};
</script>
