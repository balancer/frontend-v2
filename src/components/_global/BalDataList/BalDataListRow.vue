<script lang="ts" setup>
type Props = {
  label?: string;
  value?: string;
};

defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-2 py-1 px-2">
    <div class="flex items-center">
      <slot name="label">{{ label }}</slot>
    </div>
    <div class="flex justify-end items-center">
      <slot name="value">{{ value }}</slot>
    </div>
  </div>
</template>
