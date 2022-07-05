<template>
  <div class="lg:container lg:mx-auto pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <PoolPageHeader
        :loadingPool="loadingPool"
        :poolTypeLabel="poolTypeLabel"
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
      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div class="px-1 lg:px-0">
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
          <div class="mb-4 px-1 lg:px-0">
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
            <h4 v-text="$t('poolComposition')" class="px-4 lg:px-0 mb-4" />
            <PoolBalancesCard :pool="pool" :loading="loadingPool" />
          </div>

          <PoolTransactionsCard :pool="pool" :loading="loadingPool" />
        </div>
      </div>

      <div
        v-if="!isLiquidityBootstrappingPool"
        class="order-1 lg:order-2 px-1 lg:px-0"
      >
        <StakingProvider :poolAddress="getAddressFromPoolId(id)">
          <BalStack vertical>
            <BalLoadingBlock
              v-if="loadingPool"
              class="pool-actions-card h-60 mb-4"
            />
            <MyPoolBalancesCard
              v-else-if="!noInitLiquidity"
              :pool="pool"
              :missingPrices="missingPrices"
              class="mb-4"
            />

            <BalLoadingBlock
              v-if="loadingPool"
              class="pool-actions-card h-40"
            />
            <StakingIncentivesCard
              v-if="isStakablePool && !loadingPool"
              :pool="pool"
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
  ComputedRef,
  defineComponent,
  reactive,
  toRefs,
  watch
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
import { Pool } from '@/services/pool/types';
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
    PoolPageHeader
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
      id: route.params.id as string
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
      isStablePhantomPool
    } = usePool(poolQuery.data);
    //#endregion

    //#region pool snapshot query
    const poolSnapshotsQuery = usePoolSnapshotsQuery(
      route.params.id as string,
      pool as ComputedRef<Pool>
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

    // TODO: should be removed when fetching apr from sdk is implemented
    //#region APR query
    const aprQuery = usePoolAprQuery(
      route.params.id as string,
      pool as ComputedRef<Pool>
    );
    const loadingApr = computed(
      () =>
        aprQuery.isLoading.value ||
        aprQuery.isIdle.value ||
        Boolean(aprQuery.error.value)
    );
    const poolApr = computed(() => aprQuery.data.value);
    //#endregion

    const noInitLiquidity = computed(
      () =>
        !loadingPool.value &&
        pool.value &&
        Number(pool.value?.onchain?.totalSupply || '0') === 0
    );

    const poolTypeLabel = computed(() => {
      if (!pool.value) return '';
      const key = POOLS.Factories[pool.value.factory];

      return key ? t(key) : t('unknownPoolType');
    });

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
          priority: AlertPriority.MEDIUM
        });
      } else {
        removeAlert('pool-fetch-error');
      }
    });

    return {
      // data
      ...toRefs(data),
      // computed
      pool,
      explorer: explorerLinks,
      noInitLiquidity,
      poolTypeLabel,
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
      loadingApr
    };
  }
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
</style>
