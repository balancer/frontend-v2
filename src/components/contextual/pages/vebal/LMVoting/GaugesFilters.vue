<script setup lang="ts">
/**
 * TYPES
 */
type Props = {
  networkOptions: { [key: number]: string };
  activeNetworkOptions: number[];
  debouncedHideExpiredGauges: boolean;
};

const emit = defineEmits<{
  (e: 'choose-network', value: number): void;
  (e: 'update:debouncedHideExpiredGauges', value: boolean): void;
}>();

/**
 * PROPS
 */
defineProps<Props>();

function handleExpInput(e) {
  emit('update:debouncedHideExpiredGauges', e.target.checked);
}
</script>

<template>
  <BalPopover noPad>
    <template #activator>
      <div class="gauge-filter">
        <div class="flex flex-1 items-center h-full text-gray-600">
          <BalIcon name="filter" size="lg" class="mr-3" />
          <div class="text-gray-600">
            {{ $t('gaugeFilter.moreFilters') }}
          </div>
        </div>
      </div>
    </template>
    <template #default="{ close }">
      <div
        class="flex overflow-hidden flex-col py-4 px-3 w-64 rounded-lg"
        @click="close"
      >
        <div class="text-xl font-bold whitespace-nowrap">
          {{ $t('network') }}
        </div>
        <div
          v-for="network in Object.keys(networkOptions)"
          :key="network"
          class="flex py-1 text-base text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
          @click="emit('choose-network', Number(network))"
        >
          <BalCheckbox
            :modelValue="activeNetworkOptions.includes(Number(network))"
            name="highPriceImpactAccepted"
            :label="networkOptions[network]"
            noMargin
          />
        </div>

        <div class="py-2 text-xl font-bold">
          {{ $t('gaugeFilter.gaugeDisplay') }}
        </div>

        <BalCheckbox
          class="flex py-1 text-base text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
          name="highPriceImpactAccepted"
          :label="$t('gaugeFilter.hideExpired')"
          noMargin
          :modelValue="debouncedHideExpiredGauges"
          @input="handleExpInput"
        />
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
