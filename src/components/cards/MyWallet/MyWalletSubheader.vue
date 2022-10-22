<script setup lang="ts">

</script>

<template>
  <div class="my-wallet-subheader">
    <slot></slot>
  </div>
</template>


<style scoped>
.my-wallet-subheader {
  @apply py-2 px-3 -mx-3  dark:bg-gray-800 border-gray-200 dark:border-0;
}
</style>
