<script setup lang="ts">
type Props = {
  isLoading: boolean;
};

withDefaults(defineProps<Props>(), {
  isLoading: false,
});
</script>

<template>
  <div class="relative">
    <div v-if="isLoading" class="loader"></div>
    <slot />
  </div>
</template>

<style scoped>
.loader {
  position: absolute;
  top: -2px;
  right: -3px;
  border: 2px solid transparent;
  border-radius: 50%;
  border-top: 2px solid #f97316;
  border-right: 2px solid #f97316;
  border-bottom: 2px solid #f97316;
  width: 37px;
  height: 37px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>