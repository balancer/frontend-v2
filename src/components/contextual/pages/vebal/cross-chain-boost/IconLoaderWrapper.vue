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

<style>
.loader {
  position: absolute;
  top: -2px;
  right: 4px;
  border: 2px solid #f3f3f3;
  border-radius: 50%;
  border-top: 2px solid #f97316;
  border-right: 2px solid #f97316;
  border-bottom: 2px solid #f97316;
  width: 38px;
  height: 38px;
  -webkit-animation: spin 2s linear infinite;
  animation: spin 2s linear infinite;
}

@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
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