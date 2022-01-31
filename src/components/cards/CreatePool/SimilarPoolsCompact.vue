<script lang="ts" setup>
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';

import { Pool } from '@/services/balancer/subgraph/types';

/**
 * COMPOSABLES
 */
const { similarPools } = usePoolCreation();
const { tokens } = useTokens();
const { fNum2 } = useNumbers();
/**
 * FUNCTIONS
 */
function getPoolLabel(pool: Pool) {
  const tokensString = pool.tokens
    .map(
      t =>
        `${tokens.value[t.address]?.symbol} ${fNum2(
          t.weight,
          FNumFormats.percent
        )}`
    )
    .join(', ');
  return `${tokensString} (${fNum2(pool.swapFee, FNumFormats.percent)} fee)`;
}
</script>

<template>
  <BalCard noPad shadow="none">
    <BalStack
      spacing="sm"
      align="center"
      horizontal
      class="p-2 px-3 border-b dark:border-gray-600 text-yellow-500"
    >
      <BalIcon class="mt-1" name="alert-circle" size="md" />
      <h6>{{ $t('createAPool.similarPoolsExist') }}</h6>
    </BalStack>
    <BalStack vertical spacing="sm" class="p-4">
      <BalLink
        target="_blank"
        :href="`/#/pool/${pool.id}`"
        v-for="pool in similarPools"
        :key="`similarpool-${pool.id}`"
      >
        <span class="text-sm">{{ getPoolLabel(pool) }}</span>
      </BalLink>
    </BalStack>
  </BalCard>
</template>
