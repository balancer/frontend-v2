<template>
  <div class="lg:container lg:mx-auto pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2">
        <BalLoadingBlock v-if="loadingPool" class="h-16" />
        <div v-else class="px-4 lg:px-0 flex flex-col">
          <div class="flex flex-wrap items-center -mt-2">
            <h3 class="pool-title">
              {{ poolTypeLabel }}
            </h3>
            <div
              v-for="([address, tokenMeta], i) in titleTokens"
              :key="i"
              class="mt-2 mr-2 flex items-center px-2 h-10 bg-gray-50 dark:bg-gray-850 rounded-lg"
            >
              <BalAsset :address="address" />
              <span class="ml-2">
                {{ tokenMeta.symbol }}
              </span>
              <span
                v-if="!isStableLikePool"
                class="font-medium text-gray-400 text-xs mt-px ml-1"
              >
                {{
                  fNum2(tokenMeta.weight, {
                    style: 'percent',
                    maximumFractionDigits: 0
                  })
                }}
              </span>
            </div>
            <BalChipNew v-if="pool?.isNew" class="mt-2 mr-2" />
            <APRTooltip :pool="pool" class="-ml-1 mt-1" />
            <BalLink
              :href="explorer.addressLink(pool?.address || '')"
              external
              noStyle
              class="flex items-center"
            >
              <BalIcon
                name="arrow-up-right"
                size="sm"
                class="ml-2 mt-2 text-gray-500 hover:text-blue-500 transition-colors"
              />
            </BalLink>
          </div>
          <div class="flex items-center mt-2">
            <div v-html="poolFeeLabel" class="text-sm text-gray-600 mr-2" />
            <BalTooltip>
              <template v-slot:activator>
                <BalLink
                  v-if="feesManagedByGauntlet"
                  :href="EXTERNAL_LINKS.Gauntlet.Home"
                  external
                >
                  <GauntletIcon />
                </BalLink>
                <BalIcon v-else name="info" size="xs" class="text-gray-400" />
              </template>
              <span>
                {{ swapFeeToolTip }}
              </span>
            </BalTooltip>
          </div>
        </div>

        <BalAlert
          v-if="!appLoading && !loadingPool && missingPrices"
          type="warning"
          :title="$t('noPriceInfo')"
          class="mt-2"
          block
        />
        <BalAlert
          v-if="!appLoading && !loadingPool && hasCustomToken"
          type="error"
          :title="$t('highRiskPool')"
          class="mt-2"
          block
        />
        <template v-if="!appLoading && !loadingPool && isAffected">
          <BalAlert
            v-for="(warning, i) in warnings"
            :key="`warning-${i}`"
            type="error"
            class="mt-2"
            block
          >
            <template #title>
              <div v-html="warning.title" />
            </template>
            <template #description>
              <div v-html="warning.description" />
            </template>
          </BalAlert>
        </template>
        <BalAlert
          v-if="!appLoading && noInitLiquidity"
          type="warning"
          :title="$t('noInitLiquidity')"
          :description="$t('noInitLiquidityDetail')"
          class="mt-2"
          block
        />
      </div>

      <div class="hidden lg:block" />

      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div class="px-1 lg:px-0">
            <PoolChart
              :pool="pool"
              :historicalPrices="historicalPrices"
              :snapshots="snapshots"
              :loading="isLoadingSnapshots"
            />
          </div>
          <div class="mb-4 px-1 lg:px-0">
            <PoolStatCards :pool="pool" :loading="loadingPool" />
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

          <div>
            <PoolTransactionsCard :pool="pool" :loading="loadingPool" />
          </div>
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
import { computed, defineComponent, reactive, toRefs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import BalChipNew from '@/components/chips/BalChipNew.vue';
import * as PoolPageComponents from '@/components/contextual/pages/pool';
import StakingIncentivesCard from '@/components/contextual/pages/pool/StakingIncentivesCard/StakingIncentivesCard.vue';
import GauntletIcon from '@/components/images/icons/GauntletIcon.vue';
import ApyVisionPoolLink from '@/components/links/ApyVisionPoolLink.vue';
import APRTooltip from '@/components/tooltips/APRTooltip/APRTooltip.vue';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import useApp from '@/composables/useApp';
import { isL2 } from '@/composables/useNetwork';
import useNumbers from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import { usePoolWarning } from '@/composables/usePoolWarning';
import useTokens from '@/composables/useTokens';
import { EXTERNAL_LINKS } from '@/constants/links';
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
    GauntletIcon,
    APRTooltip,
    StakingIncentivesCard,
    StakingProvider,
    ApyVisionPoolLink,
    BalChipNew
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { appLoading } = useApp();
    const { t } = useI18n();
    const route = useRoute();
    const { fNum2 } = useNumbers();
    const { explorerLinks, isWalletReady } = useWeb3();
    const { prices } = useTokens();
    const { blockNumber, isKovan, isMainnet, isPolygon } = useWeb3();
    const { addAlert, removeAlert } = useAlerts();
    const { balancerTokenListTokens } = useTokens();
    const { isAffected, warnings } = usePoolWarning(route.params.id as string);

    /**
     * QUERIES
     */
    const poolQuery = usePoolQuery(route.params.id as string);
    const poolSnapshotsQuery = usePoolSnapshotsQuery(
      route.params.id as string,
      30
    );

    /**
     * STATE
     */
    const data = reactive<PoolPageData>({
      id: route.params.id as string
    });

    /**
     * COMPUTED
     */
    const pool = computed(() => poolQuery.data.value);
    const {
      isStableLikePool,
      isLiquidityBootstrappingPool,
      isStablePhantomPool
    } = usePool(poolQuery.data);

    const noInitLiquidity = computed(
      () =>
        !loadingPool.value &&
        pool.value &&
        Number(pool.value?.onchain?.totalSupply || '0') === 0
    );

    const communityManagedFees = computed(
      () => pool.value?.owner == POOLS.DelegateOwner
    );
    const feesManagedByGauntlet = computed(
      () =>
        communityManagedFees.value &&
        POOLS.DynamicFees.Gauntlet.includes(data.id)
    );
    const feesFixed = computed(() => pool.value?.owner == POOLS.ZeroAddress);
    const swapFeeToolTip = computed(() => {
      if (feesManagedByGauntlet.value) {
        return t('feesManagedByGauntlet');
      } else if (communityManagedFees.value) {
        return t('delegateFeesTooltip');
      } else if (feesFixed.value) {
        return t('fixedFeesTooltip');
      } else {
        return t('ownerFeesTooltip');
      }
    });

    const poolQueryLoading = computed(
      () =>
        poolQuery.isLoading.value ||
        poolQuery.isIdle.value ||
        poolQuery.error.value
    );

    const loadingPool = computed(() => poolQueryLoading.value || !pool.value);

    const snapshots = computed(() => poolSnapshotsQuery.data.value?.snapshots);
    const historicalPrices = computed(
      () => poolSnapshotsQuery.data.value?.prices
    );
    const isLoadingSnapshots = computed(
      () =>
        poolSnapshotsQuery.isLoading.value || poolSnapshotsQuery.isIdle.value
    );

    const titleTokens = computed(() => {
      if (!pool.value) return [];
      if (!pool.value?.onchain?.tokens) return [];

      return Object.entries(pool.value.onchain.tokens).sort(
        ([, a]: any[], [, b]: any[]) => b.weight - a.weight
      );
    });

    const poolTypeLabel = computed(() => {
      if (!pool.value) return '';
      const key = POOLS.Factories[pool.value.factory];

      return key ? t(key) : t('unknownPoolType');
    });

    const poolFeeLabel = computed(() => {
      if (!pool.value) return '';
      if (!pool.value?.onchain?.swapFee) return '';

      const feeLabel = `${fNum2(pool.value.onchain.swapFee, {
        style: 'percent',
        maximumFractionDigits: 4
      })}`;

      if (feesFixed.value) {
        return t('fixedSwapFeeLabel', [feeLabel]);
      } else if (communityManagedFees.value) {
        return feesManagedByGauntlet.value
          ? t('dynamicSwapFeeLabel', [feeLabel])
          : t('communitySwapFeeLabel', [feeLabel]);
      }

      // Must be owner-controlled
      return t('dynamicSwapFeeLabel', [feeLabel]);
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

    const isCopperNetworkSupported = computed(
      () => isMainnet.value || isPolygon.value || isKovan.value
    );

    // Temporary solution to hide Copper card on Fei pool page.
    // Longer terms solution is needed distinguish LBP platforms
    // and display custom widgets linking to their pages.
    const isCopperPool = computed((): boolean => {
      const feiPoolId =
        '0xede4efcc5492cf41ed3f0109d60bc0543cfad23a0002000000000000000000bb';
      return (
        !!pool.value &&
        isLiquidityBootstrappingPool.value &&
        pool.value.id !== feiPoolId &&
        isCopperNetworkSupported.value
      );
    });

    const copperNetworkPrefix = computed(() => {
      if (isPolygon.value) {
        return 'polygon.';
      }
      if (isKovan.value) {
        return 'kovan.';
      }
      return '';
    });

    const hasCustomToken = computed(() => {
      const knownTokens = Object.keys(balancerTokenListTokens.value);
      return (
        !!pool.value &&
        !isLiquidityBootstrappingPool.value &&
        !isStablePhantomPool.value &&
        pool.value.tokensList.some(
          address => !includesAddress(knownTokens, address)
        )
      );
    });

    const isStakablePool = computed((): boolean =>
      POOLS.Stakable.AllowList.includes(route.params.id as string)
    );

    /**
     * METHODS
     */
    function onNewTx(): void {
      poolQuery.refetch.value();
    }

    /**
     * WATCHERS
     */
    watch(blockNumber, () => {
      poolQuery.refetch.value();
    });

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
      EXTERNAL_LINKS,
      // computed
      appLoading,
      pool,
      explorer: explorerLinks,
      noInitLiquidity,
      poolTypeLabel,
      poolFeeLabel,
      historicalPrices,
      snapshots,
      isLoadingSnapshots,
      loadingPool,
      titleTokens,
      isWalletReady,
      missingPrices,
      feesManagedByGauntlet,
      swapFeeToolTip,
      isStableLikePool,
      isLiquidityBootstrappingPool,
      isCopperPool,
      isStablePhantomPool,
      copperNetworkPrefix,
      hasCustomToken,
      isAffected,
      warnings,
      isL2,
      isStakablePool,
      // methods
      fNum2,
      onNewTx,
      getAddressFromPoolId
    };
  }
});
</script>

<style scoped>
.pool-title {
  @apply mr-4 capitalize mt-2;
  font-variation-settings: 'wght' 700;
}

.pool-actions-card {
  @apply relative;
}

@media (min-width: 768px) and (min-height: 600px) {
  .pool-actions-card {
    @apply sticky top-24;
  }
}
</style>
