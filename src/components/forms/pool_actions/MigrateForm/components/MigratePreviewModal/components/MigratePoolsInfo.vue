<script setup lang="ts">
import { Pool } from '@/services/pool/types';
import { TokenInfo } from '@/types/TokenList';
import { computed } from 'vue';
import { POOL_MIGRATIONS_MAP } from '../../../constants';

/**
 * TYPES
 */
type Props = {
  fromPool: Pool;
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPUTED
 */
const showOldVHint = computed(
  () => POOL_MIGRATIONS_MAP[props.fromPool.id]?.showOldVHint
);
</script>

<template>
  <div
    class="relative mt-4 rounded-lg border dark:border-gray-700 divide-y dark:divide-gray-700"
  >
    <div class="flex items-center p-3">
      <BalAsset :address="fromPoolTokenInfo.address" class="mr-3" :size="36" />
      <div class="font-semibold">{{ fromPoolTokenInfo.symbol }}</div>
      <div v-if="showOldVHint" class="ml-2">
        ({{ $t('migratePool.oldVersion') }})
      </div>
    </div>
    <div class="arrow-container">
      <ArrowDownIcon />
    </div>
    <div class="flex items-center p-3 border-t dark:border-gray-900">
      <BalAsset :address="toPoolTokenInfo.address" class="mr-3" :size="36" />
      <div class="font-semibold">{{ toPoolTokenInfo.symbol }}</div>
    </div>
  </div>
</template>
<style scoped>
.card-container {
  @apply relative mt-4;
  @apply border dark:border-gray-700 rounded-lg;
}

.arrow-container {
  @apply absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2;
  @apply p-2;
  @apply rounded-full border dark:border-gray-900 bg-white dark:bg-gray-700 dark:text-gray-400;
}
</style>
