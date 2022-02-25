<script setup lang="ts">
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

import { FullPool } from '@/services/balancer/subgraph/types';

import { TokenInfo } from '@/types/TokenList';

/**
 * TYPES
 */
type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  totalLpTokens: string;
  fiatTotalLpTokens: string;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
</script>

<template>
  <div class="mb-6">
    <div class="pb-4">
      {{ $t('unlockVeBAL.unlockForm.lockedAmount.title') }}
    </div>
    <div class="rounded-lg border dark:border-gray-800 dark:bg-gray-800 p-3">
      <div class="flex items-center">
        <BalAsset :address="lockablePool.address" class="mr-2" :size="36" />
        <div class="w-full">
          <div class="flex justify-between">
            <div>{{ lockablePoolTokenInfo.symbol }}</div>
            <div>{{ fNum2(totalLpTokens, FNumFormats.token) }}</div>
          </div>
          <div class="flex justify-between text-gray-500">
            <div>{{ lockablePoolTokenInfo.name }}</div>
            <div>{{ fNum2(fiatTotalLpTokens, FNumFormats.fiat) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
