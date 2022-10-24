<script setup lang="ts">
type Props = {
  size?: 'sm' | 'md' | 'lg';
  color?: 'orange' | 'gray' | 'gradient' | 'white' | 'red';
  text: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  size: 'sm',
  color: 'orange',
});
</script>

<template>
  <BalChip v-bind="props" :color="color" class="uppercase" :outline="false">
    {{ text }}
  </BalChip>
</template>
