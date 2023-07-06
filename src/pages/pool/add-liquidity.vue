<script setup lang="ts">
import Page from '@/components/contextual/pages/pool/add-liquidity/Page.vue';
import { useIntervalFn } from '@vueuse/core';
import { oneSecondInMs } from '@/composables/useTime';
import { balancer, hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { usePool } from '@/providers/local/pool.provider';
import Col2Layout from '@/components/layouts/Col2Layout.vue';
import useBreakpoints from '@/composables/useBreakpoints';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { useRoute } from 'vue-router';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();

/**
 * PROVIDERS
 */
providePoolStaking(poolId);

/**
 * COMPOSABLES
 */
const { pool, isLoadingPool, refetchOnchainPoolData } = usePool();
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
  (): boolean => isLoadingPool.value || isLoadingSor.value
);

async function refetchOnchainPoolDataSDK() {
  const sdk = getBalancerSDK();
  const pool = await sdk.poolsOnChain.refresh(poolId);
  console.log('refetched sdk pool', pool);
}

// Instead of refetching pool data on every block, we refetch every 20s to prevent
// overfetching a request on short blocktime networks like Polygon.
useIntervalFn(refetchOnchainPoolData, oneSecondInMs * 20);
useIntervalFn(refetchOnchainPoolDataSDK, oneSecondInMs * 20);
</script>

<template>
  <div>
    <Col2Layout v-if="isLoading || !pool" leftSpan="5" rightSpan="7">
      <template v-if="!isMobile" #left>
        <BalLoadingBlock class="h-24" />
      </template>
      <template #right>
        <BalLoadingBlock class="h-96" />
      </template>
    </Col2Layout>
    <Page v-else :pool="pool" />
  </div>
</template>

