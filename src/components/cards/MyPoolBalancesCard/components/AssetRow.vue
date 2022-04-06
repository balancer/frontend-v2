<script setup lang="ts">
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

/**
 * TYPES
 */
type Props = {
  address: string;
  balance: string;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { fNum2, toFiat } = useNumbers();

/**
 * COMPUTED
 */
const token = computed(() => getToken(props.address));

const balanceLabel = computed(() => fNum2(props.balance, FNumFormats.token));

const fiatLabel = computed(() => {
  const fiatValue = toFiat(props.balance, props.address);
  return fNum2(fiatValue, FNumFormats.fiat);
});
</script>

<template>
  <div class="flex justify-between">
    <div class="flex flex-col">
      <span>
        {{ token.symbol }}
      </span>
      <span v-if="token.name !== token.symbol" class="text-sm text-gray-500">
        {{ token.name }}
      </span>
    </div>

    <div class="flex flex-col text-right">
      <span>
        {{ balanceLabel }}
      </span>
      <span class="text-sm text-gray-500">
        {{ fiatLabel }}
      </span>
    </div>
  </div>
</template>
