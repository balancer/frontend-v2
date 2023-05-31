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
  top: -3px;
  right: 5px;
  border: 2px solid #f3f3f3;
  border-radius: 50%;
  border-top: 2px solid #f97316;
  border-right: 2px solid #f97316;
  border-bottom: 2px solid #f97316;
  width: 39px;
  height: 39px;
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