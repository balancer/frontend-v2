<script lang="ts" setup>
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { Pool } from '@/services/pool/types';

/**
 * COMPOSABLES
 */
const { similarPools } = usePoolCreation();
const { getToken } = useTokens();
const { fNum2 } = useNumbers();
/**
 * FUNCTIONS
 */
function getPoolLabel(pool: Pool) {
  const tokensString = pool.tokens
    .map(
      t =>
        `${getToken(t.address)?.symbol} ${fNum2(t.weight, FNumFormats.percent)}`
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
      class="p-2 px-3 text-orange-500 border-b dark:border-gray-600"
    >
      <BalIcon class="mt-1" name="alert-circle" size="md" />
      <h6>{{ $t('createAPool.similarPoolsExist') }}</h6>
    </BalStack>
    <BalStack vertical spacing="sm" class="p-4">
      <BalLink
        v-for="pool in similarPools"
        :key="`similarpool-${pool.id}`"
        target="_blank"
        :href="`/#/pool/${pool.id}`"
      >
        <span class="text-sm">{{ getPoolLabel(pool) }}</span>
      </BalLink>
    </BalStack>
  </BalCard>
</template>
