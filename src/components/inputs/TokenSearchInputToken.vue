<script setup lang="ts">
type Props = {
  address: string;
  symbol: string;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'click'): void;
}>();
</script>
<template>
  <button @click="emit('click')" :aria-label="props.symbol">
    <BalAsset :address="props.address" />
  </button>
</template>
