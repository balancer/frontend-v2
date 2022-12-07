<script setup lang="ts">
import useBreakpoints from '@/composables/useBreakpoints';
import { removeBptFrom, usePool } from '@/composables/usePool';
import { Pool } from '@/services/pool/types';
import { toRefs } from 'vue';

import { isWeightedLike } from '@/composables/usePool';
import TokenBreakdown from './components/TokenBreakdown.vue';

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
// const isDeepPool = true; //DEBUG Deep pools
const { isDeepPool } = usePool(pool);
const { upToLargeBreakpoint } = useBreakpoints();

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

    <div class="grid gap-y-4 py-4">
      <div
        v-for="token in removeBptFrom(pool).tokens"
        :key="token.address"
        class="grid gap-y-4"
      >
        <TokenBreakdown
          :token="token"
          :isWeighted="isWeighted"
          :isDeepPool="isDeepPool"
        />
      </div>
    </div>
  </BalCard>
</template>
