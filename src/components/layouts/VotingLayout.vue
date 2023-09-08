<script lang="ts" setup>

</script>

<template>
  <div class="px-4 lg:px-0 mx-auto max-w-6xl">
    <div class="grid grid-cols-1 lg:grid-cols-10 gap-x-8 g:gap-x-8 gap-y-8">
      <div class="lg:col-span-4">
        <slot name="left" />
      </div>

      <div class="lg:col-span-6">
        <slot name="right" />
      </div>

      <slot />
    </div>
  </div>
</template>
