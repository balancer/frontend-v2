<script setup lang="ts">
import { networksMap } from '@/composables/useNetwork';
import { Network } from '@balancer-labs/sdk';
import { ref, computed } from 'vue';

/**
 * TYPES
 */
type Props = {
  networkFilters: Network[];
  showExpiredGauges: boolean;
  activeNetworkFilters: number[];
};

const emit = defineEmits<{
  (e: 'choose-network', value: number): void;
  (e: 'update:showExpiredGauges', value: boolean): void;
  (e: 'update:activeNetworkFilters', value: number[]): void;
}>();

/**
 * PROPS
 */
const props = defineProps<Props>();

function handleExpInput(e) {
  emit('update:showExpiredGauges', e.target.checked);
}

const networkFiltersArr = ref([...props.activeNetworkFilters]);
function updateNetwork(network: number) {
  const index = networkFiltersArr.value.indexOf(network);

  index === -1
    ? networkFiltersArr.value.push(network)
    : networkFiltersArr.value.splice(index, 1);

  emit('update:activeNetworkFilters', [...networkFiltersArr.value]);
}
/**
 * COMPUTED
 */
const isFilterActive = computed(() => {
  return props.activeNetworkFilters.length > 0 || props.showExpiredGauges;
});
</script>

<template>
  <BalPopover noPad>
    <template #activator>
      <BalBtn class="h-11" color="white" size="sm">
        <BalIcon
          name="filter"
          size="lg"
          class="mr-3 text-gray-600 dark:text-gray-100"
          :class="{
            'text-blue-600 dark:text-blue-600': isFilterActive,
          }"
        />
        <div
          class="text-gray-600 dark:text-gray-100"
          :class="{
            'text-blue-600 dark:text-blue-600': isFilterActive,
          }"
        >
          {{ $t('gaugeFilter.moreFilters') }}
        </div>
      </BalBtn>
    </template>
    <div class="flex overflow-hidden flex-col py-4 px-3 w-64 rounded-lg">
      <div class="text-xl font-bold whitespace-nowrap">
        {{ $t('network') }}
      </div>
      <div
        v-for="network in networkFilters"
        :key="network"
        class="flex py-1 text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
      >
        <BalCheckbox
          :modelValue="networkFiltersArr.includes(Number(network))"
          name="networkFilter"
          :label="networksMap[network]"
          noMargin
          alignCheckbox="items-center"
          @input="updateNetwork(Number(network))"
        />
      </div>

      <div class="py-2 text-xl font-bold">
        {{ $t('gaugeFilter.gaugeDisplay') }}
      </div>

      <BalCheckbox
        class="flex py-1 text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
        name="expiredGaugesFilter"
        :label="$t('gaugeFilter.showExpired')"
        noMargin
        alignCheckbox="items-center"
        :modelValue="showExpiredGauges"
        @input="handleExpInput"
      />
    </div>
  </BalPopover>
</template>
