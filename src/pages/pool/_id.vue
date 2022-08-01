<template>
  <div class="xl:container lg:px-4 pt-8 xl:mx-auto">
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
        :isStablePhantomPool="isLiquidityBootstrappingPool"
      />
      <div class="hidden lg:block" />
      <div class="order-2 lg:order-1 col-span-2">
        <div class="grid grid-cols-1 gap-y-8">
          <div class="px-4 lg:px-0">
            <PoolChart
              :pool="pool"
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
              v-if="!loadingPool"
              :poolId="pool?.id"
              :titleTokens="titleTokens"
            />
          </div>
          <div class="mb-4">
            <h4 class="px-4 lg:px-0 mb-4" v-text="$t('poolComposition')" />
            <PoolBalancesCard :pool="pool" :loading="loadingPool" />
          </div>

          <div ref="intersectionSentinel" />
          <PoolTransactionsCard
            v-if="isSentinelIntersected"
            :pool="pool"
            :loading="loadingPool"
          />
        </div>
      </div>

      <div
        v-if="!isLiquidityBootstrappingPool"
        class="order-1 lg:order-2 px-4 lg:px-0"
      >
        <StakingProvider :poolAddress="getAddressFromPoolId(id)">
          <BalStack vertical>
            <BalLoadingBlock
              v-if="loadingPool"
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
              v-if="isStakablePool && !loadingPool"
              :pool="pool"
              class="staking-incentives"
            />
          </BalStack>
        </StakingProvider>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  toRefs,
  watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import * as PoolPageComponents from '@/components/contextual/pages/pool';
import StakingIncentivesCard from '@/components/contextual/pages/pool/StakingIncentivesCard/StakingIncentivesCard.vue';
import ApyVisionPoolLink from '@/components/links/ApyVisionPoolLink.vue';
import PoolPageHeader from '@/components/pool/PoolPageHeader.vue';
import usePoolAprQuery from '@/composables/queries/usePoolAprQuery';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import { isL2 } from '@/composables/useNetwork';
import { usePool } from '@/composables/usePool';
import { usePoolWarning } from '@/composables/usePoolWarning';
import useTokens from '@/composables/useTokens';
import { POOLS } from '@/constants/pools';
import { getAddressFromPoolId, includesAddress } from '@/lib/utils';
import StakingProvider from '@/providers/local/staking/staking.provider';
import useWeb3 from '@/services/web3/useWeb3';

interface PoolPageData {
  id: string;
}

export default defineComponent({
  components: {
    ...PoolPageComponents,
    StakingIncentivesCard,
    StakingProvider,
    ApyVisionPoolLink,
    PoolPageHeader,
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { t } = useI18n();
    const route = useRoute();
    const { explorerLinks } = useWeb3();
    const { prices } = useTokens();
    const { addAlert, removeAlert } = useAlerts();
    const { isAffected, warnings } = usePoolWarning(route.params.id as string);

    /**
     * STATE
     */
    const data = reactive<PoolPageData>({
      id: route.params.id as string,
    });

    //#region pool query
    const poolQuery = usePoolQuery(route.params.id as string);
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
      isStablePhantomPool,
    } = usePool(poolQuery.data);
    //#endregion

    //#region pool snapshot query
    const poolSnapshotsQuery = usePoolSnapshotsQuery(
      route.params.id as string,
      undefined,
      // in order to prevent multiple coingecko requests
      { refetchOnWindowFocus: false }
    );
    const isLoadingSnapshots = computed(
      () =>
        poolSnapshotsQuery.isLoading.value || poolSnapshotsQuery.isIdle.value
    );

    const snapshots = computed(() => poolSnapshotsQuery.data.value?.snapshots);
    const historicalPrices = computed(
      () => poolSnapshotsQuery.data.value?.prices
    );
    //#endregion

    //#region APR query
    const aprQuery = usePoolAprQuery(route.params.id as string);
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
          isStablePhantomPool.value && pool.value.mainTokens
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
      POOLS.Stakable.AllowList.includes(route.params.id as string)
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

    return {
      // data
      ...toRefs(data),
      intersectionSentinel,
      isSentinelIntersected,
      // computed
      pool,
      explorer: explorerLinks,
      noInitLiquidity,
      historicalPrices,
      snapshots,
      isLoadingSnapshots,
      loadingPool,
      missingPrices,
      isStableLikePool,
      isLiquidityBootstrappingPool,
      isStablePhantomPool,
      isAffected,
      warnings,
      isL2,
      isStakablePool,
      titleTokens,
      // methods
      getAddressFromPoolId,
      poolApr,
      loadingApr,
    };
  },
});
</script>

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
