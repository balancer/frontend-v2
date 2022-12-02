<script setup lang="ts">
type Props = {
  addresses: string[];
  label: string;
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'click', address: string): void;
}>();
</script>
<template>
  <div
    class="flex overflow-x-auto flex-wrap gap-3 items-center px-3 text-gray-900 dark:text-gray-400 bg-white dark:bg-gray-850 rounded-lg border border-gray-100 dark:border-gray-900"
  >
    <span
      class="flex items-center self-stretch py-2 md:py-1 pr-3 border-r border-gray-100 dark:border-gray-900"
    >
      {{ props.label }}
    </span>
    <BalAsset
      v-for="address in addresses"
      :key="address"
      :address="address"
      button
      @click="emit('click', address)"
    />
  </div>
</template>
