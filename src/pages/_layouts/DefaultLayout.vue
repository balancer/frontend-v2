<script setup lang="ts">
</script>

<template>
  <div>
    <div class="app-body">
      <div class="pb-16">HELLO FROM DEFAULT LAYOUT</div>
    </div>
  </div>
</template>

<style>
.VueQueryDevtoolsPanel + button {
  @apply text-black bg-gray-100 p-2 rounded text-sm;
}

.app-body {
  @apply mb-8;

  min-height: calc(100vh - 2rem);
}
</style>
