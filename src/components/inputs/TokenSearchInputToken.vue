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
  <div
    @click="emit('click')"
    @keypress.prevent.space="emit('click')"
    role="button"
    :aria-label="props.symbol"
    :tabIndex="0"
    class="mx-1.5"
  >
    <BalAsset :address="props.address" />
  </div>
</template>
