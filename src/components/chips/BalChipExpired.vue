<script setup lang="ts">
type Props = {
  size?: 'sm' | 'md' | 'lg';
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
});
</script>

<template>
  <BalChip v-bind="props" color="red" class="uppercase" :outline="false">
    {{ $t('expired') }}
  </BalChip>
</template>
