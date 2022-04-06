<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

/**
 * TYPES
 */
type Props = {
  address: string;
  selected: boolean;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getToken, balanceFor } = useTokens();
const { fNum2, toFiat } = useNumbers();

/**
 * COMPUTED
 */
const token = computed(() => getToken(props.address));

const balanceLabel = computed(() =>
  fNum2(balanceFor(props.address), FNumFormats.token)
);

const fiatLabel = computed(() => {
  const tokenBalance = balanceFor(props.address);
  const fiatValue = toFiat(tokenBalance, props.address);

  return fNum2(fiatValue, FNumFormats.fiat);
});
</script>

<template>
  <div :class="['flex justify-between', { 'text-gray-400': !selected }]">
    <div class="flex flex-col">
      <span>
        {{ token.symbol }}
      </span>
      <span
        v-if="token.name !== token.symbol"
        :class="['text-sm', selected ? 'text-gray-500' : 'text-gray-400']"
      >
        {{ token.name }}
      </span>
    </div>

    <div class="flex flex-col text-right">
      <span>
        {{ balanceLabel }}
      </span>
      <span :class="['text-sm', selected ? 'text-gray-500' : 'text-gray-400']">
        {{ fiatLabel }}
      </span>
    </div>
  </div>
</template>
