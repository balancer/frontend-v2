<script lang="ts" setup>
type Props = {
  label?: string;
  value?: string;
};

defineProps<Props>();
</script>

<template>
  <BalCard>
    <div class="text-sm text-secondary font-medium mb-2">
      <slot name="label">
        {{ label }}
      </slot>
    </div>
    <div class="text-xl font-medium truncate flex items-center">
      <slot name="value">
        {{ value }}
      </slot>
    </div>
  </BalCard>
</template>
