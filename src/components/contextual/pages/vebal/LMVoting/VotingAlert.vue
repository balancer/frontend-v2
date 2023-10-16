<script setup lang="ts">
type Props = { title: string };
defineProps<Props>();
</script>
<template>
  <BalAlert
    v-bind="$attrs"
    type="warning"
    :title="title"
    contentClass="w-full"
    class="mx-4 xl:mx-0 mb-3"
  >
    <div
      class="flex flex-col lg:flex-row gap-2 lg:gap-4 justify-between items-baseline lg:items-start pb-1 lg:pb-0"
    >
      <div class="mr-auto max-w-3xl">
        <slot></slot>
      </div>
    </div>
  </BalAlert>
</template>



