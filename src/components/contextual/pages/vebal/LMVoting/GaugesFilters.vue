<script setup lang="ts">
/**
 * TYPES
 */
type Props = {
  networkOptions: { [key: number]: string };
  activeNetworkOptions: number[];
};

const emit = defineEmits<{
  (e: 'change-option', value: number): void;
}>();

/**
 * PROPS
 */
defineProps<Props>();
</script>

<template>
  <BalPopover noPad>
    <template #activator>
      <div class="gauge-filter">
        <div class="flex flex-1 justify-between items-center h-full">
          <BalIcon name="filter" size="lg" />
          <div>
            {{ 'More Options' }}
          </div>
        </div>
      </div>
    </template>
    <template #default="{ close }">
      <div class="flex overflow-hidden flex-col w-44 rounded-lg" @click="close">
        <div class="py-2 px-3 text-xl font-medium whitespace-nowrap">
          {{ $t('network') }}:
        </div>
        <div
          v-for="network in Object.keys(networkOptions)"
          :key="network"
          class="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
          @click="emit('change-option', Number(network))"
        >
          <BalCheckbox
            :modelValue="activeNetworkOptions.includes(Number(network))"
            name="highPriceImpactAccepted"
            size="sm"
            :label="networkOptions[network]"
          />
        </div>
      </div>
    </template>
  </BalPopover>
</template>

<style scoped>
.gauge-filter {
  @apply relative w-44 rounded-lg shadow hover:shadow-none focus:shadow-none overflow-hidden px-4
    dark:bg-gray-800 border-2 h-10 text-base transition-all;
}

.gauge-filter .bal-icon :deep(svg) {
  @apply transition-all;
}

.gauge-filter:hover .bal-icon :deep(svg),
.gauge-filter:focus .bal-icon :deep(svg) {
  stroke: theme('colors.pink.500');
}
</style>
