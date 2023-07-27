
<script setup lang="ts">
import { PoolFeatureFilter } from '@/types/pools';

export type Props = {
  modelValue: string;
};

withDefaults(defineProps<Props>(), {
  modelValue: 'Filter by feature',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void;
}>();

const options = [
  PoolFeatureFilter.Boosted,
  PoolFeatureFilter.Weighted,
  PoolFeatureFilter.Stable,
  PoolFeatureFilter.CLP,
  PoolFeatureFilter.LBP,
];

const selectedOption = ref<PoolFeatureFilter>();

watch(selectedOption, newVal => {
  emit('update:modelValue', newVal);
});
</script>

<template>
  <BalPopover
    :options="options"
    minWidth="40"
    align="left"
    @selected="emit('update:modelValue', $event)"
  >
    <template #activator>
      <BalBtn color="white" size="sm">
        <BalIcon name="filter" size="lg" />
      </BalBtn>
    </template>
    <BalVStack spacing="sm" width="40">
      <BalText size="lg" weight="bold">Pool feature</BalText>
      <div
        v-for="option in options"
        :key="option"
        class="text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
      >
        <BalCheckbox
          :modelValue="selectedOption === option"
          name="featureFilter"
          :label="option"
          noMargin
          alignCheckbox="items-center"
          @input="selectedOption = option"
        />
      </div>
    </BalVStack>
  </BalPopover>
</template>
