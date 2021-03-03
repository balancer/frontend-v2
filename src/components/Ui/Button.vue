<template>
  <button
    :type="type || 'button'"
    @click="$emit('click')"
    class="button"
    :disabled="loading"
  >
    <UiLoading v-if="loading" />
    <slot v-else />
  </button>
</template>

<script>
export default {
  props: {
    loading: Boolean,
    type: String
  },
  emits: ['click']
};
</script>

<style scoped lang="css">
.button {
  @apply bg-gray-100 dark:bg-gray-700 rounded;
  @apply font-medium;
  @apply px-4 h-12;
}
</style>
