<script lang="ts" setup>
type Props = {
  label?: string;
  value?: string;
};

defineProps<Props>();
</script>

<template>
  <BalCard>
    <div class="mb-2 text-sm font-medium text-secondary">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div class="flex items-center text-xl font-medium truncate">
      <slot name="value">
        {{ value }}
      </slot>
    </div>
  </BalCard>
</template>
