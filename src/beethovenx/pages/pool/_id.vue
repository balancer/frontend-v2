<template>
  <div class="lg:container lg:mx-auto pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2">
        <BalLoadingBlock v-if="loadingPool" class="h-16" />
        <div v-else class="px-4 lg:px-0 flex flex-col">
          <div class="flex flex-wrap items-center -mt-2">
            <h3 class="pool-title">
              {{ pool.name }}
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
                {{ fNum(tokenMeta.weight, 'percent_lg') }}
              </span>
            </div>
            <BalChip
              v-if="pool.isNewPool"
              color="red"
              size="sm"
              class="uppercase mt-2 mr-2"
              :outline="false"
            >
              {{ $t('new') }}
            </BalChip>
            <LiquidityAPRTooltip :pool="pool" class="-ml-1 mt-1" />
          </div>
          <div class="flex items-center mt-2">
            <div v-html="poolFeeLabel" class="text-sm" />
            <BalTooltip>
              <template v-slot:activator>
                <BalLink v-if="hasDefaultOwner">
                  <LudwigIcon class="ml-2" />
                </BalLink>
                <BalIcon
                  v-else
                  name="info"
                  size="xs"
                  class="text-gray-400 ml-2"
                />
              </template>
              <span>
                {{ swapFeeToolTip }}
              </span>
            </BalTooltip>
          </div>
        </div>

        <BalAlert
          v-if="!appLoading && missingPrices"
          type="warning"
          :title="$t('noPriceInfo')"
          class="mt-2"
          block
        />
        <BalAlert
          v-if="!appLoading && hasCustomToken"
          type="error"
          :title="$t('highRiskPool')"
          class="mt-2"
          block
        />
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
            <!--            <PoolChart
              :prices="historicalPrices"
              :snapshots="snapshots"
              :loading="isLoadingSnapshots"
            />-->
            <BalLoadingBlock v-if="isLoadingSnapshots" class="h-96" />
            <PoolVolumeChart v-else :snapshots="snapshots" />
          </div>
          <div class="mb-4 px-1 lg:px-0">
            <PoolStatCards :pool="pool" :loading="loadingPool" />
          </div>

          <div
            class="mb-4"
            v-if="
              loadingPool ||
                (!!pool.decoratedFarm &&
                  (pool.decoratedFarm.rewards > 0 ||
                    pool.decoratedFarm.rewardTokenPerDay > 0))
            "
          >
            <h4 class="px-4 lg:px-0 mb-4">Farm</h4>
            <FarmStatCardsLoading v-if="loadingPool || isLoadingFarms" />
            <FarmStatCards v-else :pool="pool" />
          </div>

          <div class="mb-4">
            <h4 v-text="$t('poolComposition')" class="px-4 lg:px-0 mb-4" />
            <PoolBalancesCard :pool="pool" :loading="loadingPool" />
          </div>

          <div>
            <h4
              v-text="$t('poolTransactions.title')"
              class="px-4 lg:px-0 mb-2"
            />
            <PoolTransactionsCard :pool="pool" :loading="loadingPool" />
          </div>
        </div>
      </div>

      <div
        v-if="!isLiquidityBootstrappingPool"
        class="order-1 lg:order-2 px-1 lg:px-0"
      >
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

        <BalLoadingBlock v-if="loadingPool" class="pool-actions-card h-40" />
        <PoolActionsCard
          v-else-if="!noInitLiquidity"
          :pool="pool"
          :missingPrices="missingPrices"
        />
      </div>
      <div v-else class="order-1 lg:order-2 px-1 lg:px-0">
        <BalCard noPad>
          <div class="p-4 mt-2">
            <div class="mb-4 font-semibold">
              This is a Liquidity Bootstrapping Pool (LBP)
            </div>
            <div class="mb-4 text-sm">
              LBPs are usually used for token fair launch auctions (FLAs).
              Beethoven X will soon support a fully permissionless interface to
              allow anyone to create a FLA.
            </div>
            <div class="italic mb-4 text-sm">
              Only the pool creator has permission to add or remove liquidity
              from an LBP.
            </div>
          </div>
        </BalCard>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs, watch } from 'vue';
import * as PoolPageComponents from '@/components/contextual/pages/pool';
import LudwigIcon from '@/beethovenx/components/images/LudwigIcon.vue';
import LiquidityAPRTooltip from '@/components/tooltips/LiquidityAPRTooltip.vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import useNumbers from '@/composables/useNumbers';
import { usePool } from '@/composables/usePool';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/beethovenx/composables/queries/usePoolSnapshotsQuery';
import { POOLS } from '@/constants/pools';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useTokens from '@/composables/useTokens';
import useApp from '@/composables/useApp';
import useAlerts, { AlertPriority, AlertType } from '@/composables/useAlerts';
import FarmStatCards from '@/beethovenx/components/pages/farm/FarmStatCards.vue';
import FarmStatCardsLoading from '@/beethovenx/components/pages/farm/FarmStatCardsLoading.vue';
import usePoolWithFarm from '@/beethovenx/composables/pool/usePoolWithFarm';
import PoolVolumeChart from '@/beethovenx/components/pages/pool/PoolVolumeChart.vue';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import useConfig from '@/composables/useConfig';

interface PoolPageData {
  id: string;
}

export default defineComponent({
  components: {
    BalLoadingBlock,
    PoolVolumeChart,
    ...PoolPageComponents,
    LudwigIcon,
    LiquidityAPRTooltip,
    FarmStatCards,
    FarmStatCardsLoading
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { appLoading } = useApp();
    const { t } = useI18n();
    const route = useRoute();
    const { fNum } = useNumbers();
    const { isWalletReady } = useWeb3();
    const { prices } = useTokens();
    const { blockNumber } = useWeb3();
    const { addAlert, removeAlert } = useAlerts();
    const { balancerTokenListTokens } = useTokens();
    const { networkConfig } = useConfig();

    const { pool, loadingPool, isLoadingFarms } = usePoolWithFarm(
      route.params.id as string
    );

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

    const {
      isStableLikePool,
      isLiquidityBootstrappingPool,
      isStablePhantomPool
    } = usePool(poolQuery.data);

    const noInitLiquidity = computed(
      () =>
        !loadingPool.value &&
        pool.value &&
        Number(pool.value.onchain?.totalSupply) === 0
    );

    const communityManagedFees = computed(
      () => pool.value?.owner == POOLS.DelegateOwner
    );

    const feesFixed = computed(() => pool.value?.owner == POOLS.ZeroAddress);
    const swapFeeToolTip = computed(() => {
      if (communityManagedFees.value) {
        return t('delegateFeesTooltip');
      } else if (feesFixed.value) {
        return t('fixedFeesTooltip');
      } else if (hasDefaultOwner.value) {
        return t('ownerBeethovenFeesTooltip');
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

      return Object.entries(pool.value.onchain?.tokens || {}).sort(
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
      const feeLabel = `${fNum(pool.value.onchain?.swapFee || '0', null, {
        format: '0.00[00]%'
      })}`;

      if (feesFixed.value) {
        return t('fixedSwapFeeLabel', [feeLabel]);
      } else if (communityManagedFees.value) {
        return t('communitySwapFeeLabel', [feeLabel]);
      }

      // Must be owner-controlled
      return t('dynamicSwapFeeLabel', [feeLabel]);
    });

    const missingPrices = computed(() => {
      if (pool.value) {
        const tokensWithPrice = Object.keys(prices.value);

        const tokens = pool.value.mainTokens
          ? pool.value.mainTokens
          : pool.value.tokenAddresses;

        return !tokens.every(token => tokensWithPrice.includes(token));
      }
      return false;
    });

    const hasCustomToken = computed(() => {
      const knownTokens = Object.keys(balancerTokenListTokens.value);
      return (
        !!pool.value &&
        !isLiquidityBootstrappingPool.value &&
        !isStablePhantomPool.value &&
        pool.value.tokenAddresses.some(
          address => !knownTokens.includes(address)
        )
      );
    });

    const hasDefaultOwner = computed(
      () =>
        pool.value?.owner ===
        networkConfig.addresses.defaultPoolOwner.toLowerCase()
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
      swapFeeToolTip,
      isStableLikePool,
      isLiquidityBootstrappingPool,
      isLoadingFarms,
      hasCustomToken,
      hasDefaultOwner,
      // methods
      fNum,
      onNewTx
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
