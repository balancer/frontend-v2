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
const props = defineProps<Props>();

function handleExpInput() {
  console.log('emited');
  emit('update:debouncedHideExpiredGauges', !props.debouncedHideExpiredGauges);
}
</script>

<template>
  <BalPopover noPad>
    <template #activator>
      <div class="gauge-filter">
        <div class="flex flex-1 justify-between items-center h-full">
          <BalIcon name="filter" size="lg" />
          <div>
            {{ $t('gaugeFilter.moreOptions') }}
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
          class="flex py-3 text-base hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer gray-850"
          @click="emit('choose-network', Number(network))"
        >
          <BalCheckbox
            :modelValue="activeNetworkOptions.includes(Number(network))"
            name="highPriceImpactAccepted"
            :label="networkOptions[network]"
          />
        </div>

        <div class="py-2 text-xl font-bold">
          {{ $t('gaugeFilter.gaugeDisplay') }}
        </div>

        <BalCheckbox
          class="flex py-3 text-base hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer gray-850"
          name="highPriceImpactAccepted"
          :label="$t('gaugeFilter.hideExpired')"
          noMargin
          :modelValue="debouncedHideExpiredGauges"
          @input="handleExpInput"
        />
        <BalCheckbox
          class="flex py-3 text-base hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer gray-850"
          :modelValue="true"
          name="highPriceImpactAccepted"
          :label="$t('gaugeFilter.showStake')"
          noMargin
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
