
<script setup lang="ts">
import { PoolTypeFilter, PoolAttributeFilter } from '@/types/pools';

type Props = {
  selectedPoolType: PoolTypeFilter | undefined;
  selectedAttributes: PoolAttributeFilter[];
};

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:selectedPoolType', value: PoolTypeFilter | undefined): void;
  (e: 'update:selectedAttributes', value: PoolAttributeFilter[]): void;
}>();

const options = [
  PoolTypeFilter.Weighted,
  PoolTypeFilter.Stable,
  PoolTypeFilter.CLP,
  PoolTypeFilter.LBP,
  PoolTypeFilter.LRT,
];

const attributeOptions = [PoolAttributeFilter.New];

const _selectedPoolType = ref<PoolTypeFilter>();
const _selectedAttributes = reactive<PoolAttributeFilter[]>([]);
const activeFiltersNum = computed((): number => {
  return _selectedAttributes.length + (_selectedPoolType.value ? 1 : 0);
});

watch(
  () => props.selectedPoolType,
  newSelectedPoolType => {
    _selectedPoolType.value = newSelectedPoolType;
  }
);

watch(_selectedPoolType, newVal => {
  emit('update:selectedPoolType', newVal);
});

watch(_selectedAttributes, newVal => {
  emit('update:selectedAttributes', newVal);
});

function handlePoolTypeCheck(event, option) {
  if (event.target.checked) {
    _selectedPoolType.value = option;
  } else {
    _selectedPoolType.value = undefined;
  }
}

function handleAttributeCheck(event, option) {
  if (event.target.checked) {
    _selectedAttributes.push(option);
  } else {
    const index = _selectedAttributes.indexOf(option);
    _selectedAttributes.splice(index, 1);
  }
}
</script>

<template>
  <BalPopover minWidth="40" align="left">
    <template #activator>
      <BalBtn color="white" size="sm">
        <BalIcon name="filter" size="sm" class="mr-2" />
        More filters
        <div v-if="activeFiltersNum > 0" class="px-2">
          <div
            class="flex justify-center items-center p-2 w-5 h-5 text-xs text-center text-white bg-blue-600 rounded-full"
          >
            {{ activeFiltersNum }}
          </div>
        </div>
      </BalBtn>
    </template>
    <BalVStack spacing="md" width="40">
      <BalVStack spacing="sm">
        <BalText size="lg" weight="bold">Pool type</BalText>
        <div
          v-for="option in options"
          :key="option"
          class="text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
        >
          <BalCheckbox
            :modelValue="_selectedPoolType === option"
            :name="option"
            :label="option"
            noMargin
            alignCheckbox="items-center"
            @input="event => handlePoolTypeCheck(event, option)"
          />
        </div>
      </BalVStack>

      <BalVStack spacing="sm">
        <BalText size="lg" weight="bold" margin>Pool attributes</BalText>
        <div
          v-for="option in attributeOptions"
          :key="option"
          class="text-base text-gray-600 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
        >
          <BalCheckbox
            :modelValue="_selectedAttributes.includes(option)"
            :name="option"
            :label="option"
            noMargin
            alignCheckbox="items-center"
            @input="event => handleAttributeCheck(event, option)"
          />
        </div>
      </BalVStack>
    </BalVStack>
  </BalPopover>
</template>
