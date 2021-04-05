<template>
  <div class="flex items-center">
    <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
    <input
      ref="searchInput"
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="border-0 input flex-auto w-full bg-transparent"
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
    }
  }
};
</script>
