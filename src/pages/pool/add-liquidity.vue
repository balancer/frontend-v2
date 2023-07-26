<script setup lang="ts">
import Page from '@/components/contextual/pages/pool/add-liquidity/Page.vue';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { usePool } from '@/providers/local/pool.provider';
import Col2Layout from '@/components/layouts/Col2Layout.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { useRoute } from 'vue-router';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { PoolWithMethods } from '@balancer-labs/sdk';
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
const { isMobile } = useBreakpoints();

/**
 * COMPUTED
 */
// We only need to wait for SOR if it's a deep pool.
const isLoadingSor = computed(
  (): boolean => isDeepPool.value && !hasFetchedPoolsForSor.value
);

const isLoading = computed(
  (): boolean =>
    isLoadingPool.value || isLoadingSor.value || isLoadingSDKPool.value
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
  <div>
    <Col2Layout
      v-if="isLoading || !pool || !sdkPool"
      leftSpan="5"
      rightSpan="7"
    >
      <template v-if="!isMobile" #left>
        <BalLoadingBlock class="h-24" />
      </template>
      <template #right>
        <BalLoadingBlock class="h-96" />
      </template>
    </Col2Layout>
    <Page v-else :pool="pool" :sdkPool="sdkPool" />
  </div>
</template>

