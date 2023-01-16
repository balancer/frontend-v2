<script setup lang="ts">
import { ref } from 'vue';

/**
 * TYPES
 */
type Props = {
  networkOptions: { [key: number]: string };
  debouncedHideExpiredGauges: boolean;
  debouncedActiveNetworkFilters: number[];
};

const emit = defineEmits<{
  (e: 'choose-network', value: number): void;
  (e: 'update:debouncedHideExpiredGauges', value: boolean): void;
  (e: 'update:debouncedActiveNetworkFilters', value: number[]): void;
}>();

/**
 * PROPS
 */
const props = defineProps<Props>();

function handleExpInput(e) {
  emit('update:debouncedHideExpiredGauges', e.target.checked);
}

const networkFiltersArr = ref([...props.debouncedActiveNetworkFilters]);
function updateNetwork(network: number) {
  const index = networkFiltersArr.value.indexOf(network);

  index === -1
    ? networkFiltersArr.value.push(network)
    : networkFiltersArr.value.splice(index, 1);

  emit('update:debouncedActiveNetworkFilters', [...networkFiltersArr.value]);
}
</script>

<template>
  <BalPopover noPad>
    <template #activator>
      <BalBtn class="h-11" color="white" size="sm">
        <BalIcon name="filter" size="lg" class="mr-3 dark:text-gray-100" />
        <div class="text-gray-600 dark:text-gray-100">
          {{ $t('gaugeFilter.moreFilters') }}
        </div>
      </BalBtn>
    </template>
    <div class="flex overflow-hidden flex-col py-4 px-3 w-64 rounded-lg">
      <div class="text-xl font-bold whitespace-nowrap">
        {{ $t('network') }}
      </div>
      <div
        v-for="network in Object.keys(networkOptions)"
        :key="network"
        class="flex py-1 text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
      >
        <BalCheckbox
          :modelValue="networkFiltersArr.includes(Number(network))"
          name="highPriceImpactAccepted"
          :label="networkOptions[network]"
          noMargin
          @input="updateNetwork(Number(network))"
        />
      </div>

      <div class="py-2 text-xl font-bold">
        {{ $t('gaugeFilter.gaugeDisplay') }}
      </div>

      <BalCheckbox
        class="flex py-1 text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
        name="highPriceImpactAccepted"
        :label="$t('gaugeFilter.hideExpired')"
        noMargin
        :modelValue="debouncedHideExpiredGauges"
        @input="handleExpInput"
      />
    </div>
  </BalPopover>
</template>
