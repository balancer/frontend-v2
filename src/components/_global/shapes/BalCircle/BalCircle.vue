<script setup lang="ts">
type Props = {
  size?: string;
  color?: string;
};

const props = withDefaults(defineProps<Props>(), {
  size: '16',
  color: 'gray',
});

const classes = computed(() => ({
  [`w-${props.size} h-${props.size}`]: true,
  [`bg-${props.color}-500`]: true,
}));
</script>

<template>
  <div :class="['bal-circle', classes]">
    <slot />
  </div>
</template>

<style scoped>
.bal-circle {
  @apply rounded-full flex items-center justify-center;

  margin-bottom: 0;
}
</style>
