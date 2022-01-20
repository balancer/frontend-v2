<script setup lang="ts">
import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  fromPoolTokenInfo: TokenInfo;
  toPoolTokenInfo: TokenInfo;
};

/**
 * PROPS
 */
defineProps<Props>();
</script>

<template>
  <div
    class="relative border dark:border-gray-700 divide-y dark:divide-gray-700 rounded-lg mt-4"
  >
    <div class="flex items-center p-3">
      <BalAsset :address="fromPoolTokenInfo.address" class="mr-2" :size="36" />
      <div>{{ fromPoolTokenInfo.symbol }}</div>
    </div>
    <div class="arrow-container">
      <ArrowDownIcon />
    </div>
    <div class="flex items-center p-3 border-t dark:border-gray-900">
      <BalAsset :address="toPoolTokenInfo.address" class="mr-2" :size="36" />
      <div>{{ toPoolTokenInfo.symbol }}</div>
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
