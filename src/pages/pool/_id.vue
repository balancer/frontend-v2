<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import {
  PoolChart,
  PoolStatCards,
  PoolTransactionsCard,
  MyPoolBalancesCard,
  PoolBalancesCard,
  PoolContractDetails,
} from '@/components/contextual/pages/pool';
import StakingIncentivesCard from '@/components/contextual/pages/pool/StakingIncentivesCard/StakingIncentivesCard.vue';
import PoolLockingCard from '@/components/contextual/pages/pool/PoolLockingCard/PoolLockingCard.vue';
import ApyVisionPoolLink from '@/components/links/ApyVisionPoolLink.vue';
import PoolPageHeader from '@/components/pool/PoolPageHeader.vue';
import usePoolAprQuery from '@/composables/queries/usePoolAprQuery';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import { isVeBalPool, usePool } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { POOLS } from '@/constants/pools';
import { getAddressFromPoolId, includesAddress } from '@/lib/utils';
import StakingProvider from '@/providers/local/staking/staking.provider';
import useHistoricalPricesQuery from '@/composables/queries/useHistoricalPricesQuery';

/**
 * STATE
 */
const route = useRoute();
const poolId = (route.params.id as string).toLowerCase();

/**
 * COMPOSABLES
 */
const { t } = useI18n();

const { prices } = useTokens();
const { addAlert, removeAlert } = useAlerts();
const _isVeBalPool = isVeBalPool(poolId);

//#region pool query
const poolQuery = usePoolQuery(poolId, undefined, undefined, false);
const pool = computed(() => poolQuery.data.value);
const poolQueryLoading = computed(
  () =>
    poolQuery.isLoading.value ||
    poolQuery.isIdle.value ||
    Boolean(poolQuery.error.value)
);
const loadingPool = computed(() => poolQueryLoading.value || !pool.value);

const {
  isStableLikePool,
  isLiquidityBootstrappingPool,
  isComposableStableLikePool,
} = usePool(poolQuery.data);
//#endregion

//#region pool snapshot query
const poolSnapshotsQuery = usePoolSnapshotsQuery(poolId, undefined, {
  refetchOnWindowFocus: false,
});
const isLoadingSnapshots = computed(
  () => poolSnapshotsQuery.isLoading.value || poolSnapshotsQuery.isIdle.value
);

const snapshots = computed(() => poolSnapshotsQuery.data.value);
//#endregion

//#region historical prices query
const historicalPricesQuery = useHistoricalPricesQuery(
  poolId,
  undefined,
  // in order to prevent multiple coingecko requests
  { refetchOnWindowFocus: false }
);
const historicalPrices = computed(() => historicalPricesQuery.data.value);
//#endregion

//#region APR query
const aprQuery = usePoolAprQuery(poolId);
const loadingApr = computed(
  () =>
    aprQuery.isLoading.value ||
    aprQuery.isIdle.value ||
    Boolean(aprQuery.error.value)
);
const poolApr = computed(() => aprQuery.data.value);
//#endregion

//#region Intersection Observer
const intersectionSentinel = ref<HTMLDivElement | null>(null);
const isSentinelIntersected = ref(false);
let observer: IntersectionObserver | undefined;

function addIntersectionObserver(): void {
  if (
    !('IntersectionObserver' in window) ||
    !('IntersectionObserverEntry' in window) ||
    !intersectionSentinel.value
  ) {
    isSentinelIntersected.value = true;
    return;
  }

  const options = {
    rootMargin: '-100px',
  };

  const callback = (entries: IntersectionObserverEntry[]): void => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        isSentinelIntersected.value = true;
      }
    });
  };
  observer = new IntersectionObserver(callback, options);
  observer.observe(intersectionSentinel.value);
}
onMounted(() => {
  addIntersectionObserver();
});
onBeforeUnmount(() => {
  observer?.disconnect();
});
//#endregion

const noInitLiquidity = computed(
  () =>
    !loadingPool.value &&
    pool.value &&
    Number(pool.value?.onchain?.totalSupply || '0') === 0
);

const missingPrices = computed(() => {
  if (pool.value) {
    const tokensWithPrice = Object.keys(prices.value);

    const tokens =
      isComposableStableLikePool.value && pool.value.mainTokens
        ? pool.value.mainTokens
        : pool.value.tokensList;

    return !tokens.every(token => includesAddress(tokensWithPrice, token));
  }
  return false;
});

const titleTokens = computed(() => {
  if (!pool.value || !pool.value.onchain?.tokens) return [];

  return Object.entries(pool.value.onchain.tokens).sort(
    ([, a]: any[], [, b]: any[]) => b.weight - a.weight
  );
});

const isStakablePool = computed((): boolean =>
  POOLS.Stakable.AllowList.includes(poolId)
);

/**
 * WATCHERS
 */
watch(poolQuery.error, () => {
  if (poolQuery.error.value) {
    addAlert({
      id: 'pool-fetch-error',
      label: t('alerts.pool-fetch-error'),
      type: AlertType.ERROR,
      persistent: true,
      action: poolQuery.refetch.value,
      actionLabel: t('alerts.retry-label'),
      priority: AlertPriority.MEDIUM,
    });
  } else {
    removeAlert('pool-fetch-error');
  }
});
</script>

<template>
  <div class="xl:container lg:px-4 pt-8 xl:mx-auto">
    <StakingProvider :poolAddress="getAddressFromPoolId(poolId)">
      <div
        class="grid grid-cols-1 lg:grid-cols-3 gap-x-0 lg:gap-x-4 xl:gap-x-8 gap-y-8"
      >
        <PoolPageHeader
          :loadingPool="loadingPool"
          :loadingApr="loadingApr"
          :pool="pool"
          :poolApr="poolApr"
          :isStableLikePool="isStableLikePool"
          :noInitLiquidity="noInitLiquidity"
          :titleTokens="titleTokens"
          :missingPrices="missingPrices"
          :isLiquidityBootstrappingPool="isLiquidityBootstrappingPool"
          :isComposableStableLikePool="isComposableStableLikePool"
        />
        <div class="hidden lg:block" />
        <div class="order-2 lg:order-1 col-span-2">
          <div class="grid grid-cols-1 gap-y-8">
            <div class="px-4 lg:px-0">
              <PoolChart
                :historicalPrices="historicalPrices"
                :snapshots="snapshots"
                :loading="isLoadingSnapshots"
                :totalLiquidity="pool?.totalLiquidity"
                :tokensList="pool?.tokensList"
                :poolType="pool?.poolType"
              />
            </div>
            <div class="px-4 lg:px-0 mb-4">
              <PoolStatCards
                :pool="pool"
                :poolApr="poolApr"
                :loading="loadingPool"
                :loadingApr="loadingApr"
              />
              <ApyVisionPoolLink
                v-if="!loadingPool && pool"
                :poolId="pool.id"
                :titleTokens="titleTokens"
              />
            </div>
            <div class="mb-4">
              <h4 class="px-4 lg:px-0 mb-4" v-text="$t('poolComposition')" />
              <PoolBalancesCard :pool="pool" :loading="loadingPool" />
            </div>

            <div ref="intersectionSentinel" />
            <template v-if="isSentinelIntersected && pool">
              <PoolTransactionsCard :pool="pool" :loading="loadingPool" />
              <PoolContractDetails :pool="pool" />
            </template>
          </div>
        </div>

        <div
          v-if="!isLiquidityBootstrappingPool"
          class="order-1 lg:order-2 px-4 lg:px-0"
        >
          <BalStack vertical>
            <BalLoadingBlock
              v-if="loadingPool || !pool"
              class="mb-4 h-60 pool-actions-card"
            />
            <MyPoolBalancesCard
              v-else-if="!noInitLiquidity"
              :pool="pool"
              :missingPrices="missingPrices"
              class="mb-4"
            />

            <BalLoadingBlock
              v-if="loadingPool"
              class="h-40 pool-actions-card"
            />
            <StakingIncentivesCard
              v-if="isStakablePool && !loadingPool && pool"
              :pool="pool"
              class="staking-incentives"
            />
            <PoolLockingCard
              v-if="_isVeBalPool && !loadingPool && pool"
              :pool="pool"
              class="pool-locking"
            />
          </BalStack>
        </div>
      </div>
    </StakingProvider>
  </div>
</template>

<style scoped>
.pool-actions-card {
  @apply relative;
}

@media (min-width: 768px) and (min-height: 600px) {
  .pool-actions-card {
    @apply sticky top-24;
  }
}

.staking-incentives :deep(.active-section) {
  @apply border-transparent;
}
</style>
