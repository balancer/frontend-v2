<script lang="ts" setup>
import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { useTokens } from '@/providers/tokens.provider';

/**
 * TYPES
 */
type Props = {
  yieldAPR: AprBreakdown['tokenAprs'];
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getTokens } = useTokens();
const { fNum } = useNumbers();

/**
 * COMPUTED
 */
const yieldAPRTokens = computed(() => {
  return getTokens(Object.keys(props.yieldAPR.breakdown));
});

const yieldBreakdownItems = computed((): [string, number][] =>
  Object.entries(props.yieldAPR.breakdown)
);
</script>

<template>
  <div data-testid="yield-apr">
    <BalHStack justify="between" class="font-bold">
      <span>{{ $t('yieldAprRewards.apr.boosted') }}</span>
      {{ fNum(yieldAPR.total, FNumFormats.bp) }}
    </BalHStack>
    <BalVStack spacing="xs" class="mt-1">
      <BalHStack
        v-for="([address, amount], index) in yieldBreakdownItems"
        :key="index"
        justify="between"
        class="text-gray-500"
      >
        <span class="ml-2">
          {{ yieldAPRTokens[getAddress(address)]?.symbol }} {{ $t('apr') }}
        </span>
        {{ fNum(amount, FNumFormats.bp) }}
      </BalHStack>
    </BalVStack>
  </div>
</template>
