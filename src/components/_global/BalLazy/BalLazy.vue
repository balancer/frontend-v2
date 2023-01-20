<script setup lang="ts">
import { nextTick, ref } from 'vue';
const shouldRender = ref(false);
nextTick(() => {
  shouldRender.value = true;
});
</script>

<template>
  <slot v-if="shouldRender" />
</template>