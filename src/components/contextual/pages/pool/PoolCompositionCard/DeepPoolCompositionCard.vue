<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import { removePremintedBPT } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';
import { toRefs } from 'vue';

import { isWeightedLike } from '@/composables/usePool';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();
const { pool } = toRefs(props);
const isWeighted = isWeightedLike(pool.value.poolType);

/**
 * COMPOSABLES
 */
const { upToLargeBreakpoint } = useBreakpoints();

// const poolAddressesWithoutPreminted = () => {
//   const tokens = removePremintedBPT(pool.value).tokens;
//   if (!tokens) return [];
//   return tokens.map(t => t.address);
// };

/**
 * METHODS
 */
</script>

<template>
  <BalCard
    class="overflow-x-auto whitespace-nowrap"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <template #header>
      <div
        class="grid p-4 w-full text-base font-semibold border-b dark:border-gray-900"
        :class="[isWeighted ? 'grid-cols-4' : 'grid-cols-3']"
      >
        <div>{{ $t('token') }}</div>
        <div v-if="isWeighted" class="justify-self-end">
          {{ $t('weight') }}
        </div>
        <div class="justify-self-end">
          {{ $t('balance') }}
        </div>
        <div class="justify-self-end">
          {{ $t('value') }}
        </div>
      </div>
    </template>

    <!-- TODO: Remove v-if='pool' if possible-->
    <div v-if="pool" class="p-4 -mt-2">
      <div
        v-for="token in removePremintedBPT(pool).tokens"
        :key="token.address"
      >
        <TokenBreakdown :token="token"></TokenBreakdown>
      </div>
    </div>
  </BalCard>
</template>
