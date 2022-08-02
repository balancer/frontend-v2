<script lang="ts" setup>
import { computed } from 'vue';

import useUserSettings from '@/composables/useUserSettings';
import { FiatSymbol } from '@/constants/currency';

import BalLoadingBlock from '../BalLoadingBlock/BalLoadingBlock.vue';

/**
 * TYPES
 */
type NumberType = 'token' | 'fiat';

type Props = {
  type: NumberType;
  numberWidth: string;
  numberHeight: string;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  type: 'token',
  numberWidth: '3',
  numberHeight: '5',
});

/**
 * COMPOSABLES
 */
const { currency } = useUserSettings();

/**
 * COMPUTED
 */
const currencySymbol = computed(() => FiatSymbol[currency.value]);

const blockClasses = computed(() => [
  `w-${props.numberWidth}`,
  `h-${props.numberHeight}`,
  'mr-px',
]);
</script>

<template>
  <div class="flex items-center">
    <template v-if="type === 'token'">
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <span class="text-gray-300 dark:text-gray-500">.</span>
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
    </template>
    <template v-else-if="type === 'fiat'">
      <span class="mr-px text-gray-300 dark:text-gray-500">
        {{ currencySymbol }}
      </span>
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <span class="text-gray-300 dark:text-gray-500">.</span>
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
      <BalLoadingBlock :class="blockClasses" rounded="sm" darker />
    </template>
  </div>
</template>
