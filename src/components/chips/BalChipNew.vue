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
  <BalChip v-bind="props" color="orange" class="uppercase" :outline="false">
    {{ $t('new') }}
  </BalChip>
</template>
