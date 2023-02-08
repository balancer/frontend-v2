<script setup lang="ts">
const shouldRender = ref(false);
nextTick(() => {
  shouldRender.value = true;
});
</script>

<template>
  <slot v-if="shouldRender" />
</template>