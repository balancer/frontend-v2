<script setup lang="ts">
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { oneSecondInMs } from '@/composables/useTime';
import { useIntervalFn } from '@vueuse/core';
import { computed } from 'vue';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import WithdrawPage from '@/components/contextual/pages/pool/withdraw/WithdrawPage.vue';
import { useTokens } from '@/providers/tokens.provider';
import { usePool } from '@/providers/local/pool.provider';
import { Pool } from '@balancer-labs/sdk';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';

const sdk = getBalancerSDK();

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();
const sdkPool = ref<Pool | undefined>();

/**
 * COMPOSABLES
 */
const { pool, isLoadingPool, refetchOnchainPoolData } = usePool();
const { isDeepPool } = usePoolHelpers(pool);
const { balanceQueryLoading } = useTokens();

// Instead of refetching pool data on every block, we refetch every 20s to prevent
// overfetching a request on short blocktime networks like Polygon.
useIntervalFn(refetchOnchainPoolData, oneSecondInMs * 20);

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean =>
    isLoadingPool.value || isLoadingSor.value || balanceQueryLoading.value
);

/**
 * METHODS
 */
async function refetchOnchainPoolDataSDK() {
  if (sdkPool.value) {
    await sdk.data.poolsOnChain.refresh(sdkPool.value);
    console.log('Refetched onchain pool data');
  }
}

// Instead of refetching pool data on every block, we refetch every 20s to prevent
// overfetching a request on short blocktime networks like Polygon.
useIntervalFn(refetchOnchainPoolDataSDK, oneSecondInMs * 20);

onBeforeMount(async () => {
  sdkPool.value = await sdk.pools.find(poolId);
});
</script>

<template>
  <div class="px-4 sm:px-0 mx-auto max-w-md">
    <BalLoadingBlock v-if="isLoading || !pool" class="h-96" />
    <WithdrawPage v-else :pool="pool" />
  </div>
</template>
