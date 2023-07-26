<script setup lang="ts">
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import WithdrawPage from '@/components/contextual/pages/pool/withdraw/WithdrawPage.vue';
import { useTokens } from '@/providers/tokens.provider';
import { usePool } from '@/providers/local/pool.provider';
import { PoolWithMethods } from '@balancer-labs/sdk';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { trackLoading } from '@/lib/utils';

const sdk = getBalancerSDK();

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();
const sdkPool = ref<PoolWithMethods | undefined>();
const isLoadingSDKPool = ref(true);

/**
 * COMPOSABLES
 */
const { pool, isLoadingPool } = usePool();
const { isDeepPool } = usePoolHelpers(pool);
const { balanceQueryLoading } = useTokens();

// // Instead of refetching pool data on every block, we refetch every 20s to prevent
// // overfetching a request on short blocktime networks like Polygon.
// useIntervalFn(refetchOnchainPoolData, oneSecondInMs * 20);

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean =>
    isLoadingPool.value ||
    isLoadingSor.value ||
    balanceQueryLoading.value ||
    isLoadingSDKPool.value
);

/**
 * METHODS
 */
// async function refetchOnchainPoolDataSDK() {
//   if (sdkPool.value) {
//     await sdk.data.poolsOnChain.refresh(sdkPool.value);
//     console.log('Refetched onchain pool data');
//   }
// }

// // Instead of refetching pool data on every block, we refetch every 20s to prevent
// // overfetching a request on short blocktime networks like Polygon.
// useIntervalFn(refetchOnchainPoolDataSDK, oneSecondInMs * 20);

onBeforeMount(async () => {
  trackLoading(async () => {
    sdkPool.value = await sdk.pools.find(poolId);
  }, isLoadingSDKPool);
});
</script>

<template>
  <div class="px-4 sm:px-0 mx-auto max-w-md">
    <BalLoadingBlock v-if="isLoading || !pool || !sdkPool" class="h-96" />
    <WithdrawPage v-else :pool="pool" :sdkPool="sdkPool" />
  </div>
</template>
