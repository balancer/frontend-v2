<script setup lang="ts">
import { FullPool } from '@/services/balancer/subgraph/types';

import { TokenInfo } from '@/types/TokenList';
import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

type Props = {
  lockablePool: FullPool;
  lockablePoolTokenInfo: TokenInfo;
  veBalLockInfo: VeBalLockInfo;
};

/**
 * PROPS
 */
defineProps<Props>();

/**
 * COMPUTED
 */
// const lockAmountFiatValue = computed(() =>
//   bnum(props.lockablePool.totalLiquidity)
//     .div(props.lockablePool.totalShares)
//     .times(props.veBalLockInfo?.lockedAmount ?? '0')
// );
</script>

<template>
  <div class="mb-6">
    <div class="rounded-lg border dark:border-gray-800 dark:bg-gray-800 p-3">
      <div class="flex items-center">
        <BalAsset :address="lockablePool.address" class="mr-2" :size="36" />
        <div>
          <div>{{ lockablePoolTokenInfo.symbol }}</div>
          <div class="text-gray-500">
            {{ lockablePoolTokenInfo.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
