<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import useNetwork from '@/composables/useNetwork';
import {
  deprecatedDetails,
  isStableLike,
  orderedPoolTokens,
  orderedTokenAddresses,
} from '@/composables/usePool';
import { POOLS } from '@/constants/pools';
import TokenPills from '@/components/tables/PoolsTable/TokenPills/TokenPills.vue';
import BalChipNew from '@/components/chips/BalChipNew.vue';

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

function iconAddresses(pool: Pool) {
  return POOLS.Metadata[pool.id]?.hasIcon
    ? [pool.address]
    : orderedTokenAddresses(pool);
}
</script>

<template>
  <div
    class="flex justify-between items-center py-3 border-t border-gray-300 border-opacity-25"
  >
    <div class="flex items-center">
      <BalAssetSet :addresses="iconAddresses(pool)" :width="100" />
      <TokenPills :tokens="orderedPoolTokens(pool, pool.tokens)" />
      <BalChipNew v-if="true" class="mb-1" />
    </div>
    <BalIcon
      name="arrow-right"
      size="sm"
      class="mb-1 text-gray-300 group-hover:text-purple-600 dark:text-gray-600 dark:group-hover:text-yellow-500;"
    />
  </div>
</template>
