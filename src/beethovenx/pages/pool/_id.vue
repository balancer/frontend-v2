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
              v-if="pool.dynamic.isNewPool"
              color="red"
              size="sm"
              class="uppercase mt-2 mr-2"
              :outline="false"
            >
              {{ $t('new') }}
            </BalChip>
            <LiquidityMiningTooltip :pool="pool" class="-ml-1 mt-1" />
          </div>
          <div class="flex items-center mt-2">
            <div v-html="poolFeeLabel" class="text-sm" />
            <BalTooltip>
              <template v-slot:activator>
                <BalLink
                  v-if="feesManagedByGauntlet"
                  :href="EXTERNAL_LINKS.Gauntlet.Home"
                  external
                >
                  <GauntletIcon class="ml-2" />
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
              :prices="historicalPrices"
              :snapshots="snapshots"
              :loading="isLoadingSnapshots"
            />
          </div>
          <div class="mb-4 px-1 lg:px-0">
            <PoolStatCards :pool="pool" :loading="loadingPool" />
          </div>

          <div class="mb-4" v-if="loadingPool || !!pool.farm">
            <h4 class="px-4 lg:px-0 mb-4">Farm</h4>
            <FarmStatCardsLoading v-if="loadingPool" />
            <FarmStatCards
              v-else
              :farm="pool.farm"
              :token-address="pool.address"
            />
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
import { defineComponent, reactive, toRefs, computed, watch } from 'vue';
import * as PoolPageComponents from '@/components/contextual/pages/pool';
import GauntletIcon from '@/components/images/icons/GauntletIcon.vue';
import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';
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
import usePools from '@/composables/pools/usePools';

interface PoolPageData {
  id: string;
}

export default defineComponent({
  components: {
    ...PoolPageComponents,
    GauntletIcon,
    LiquidityMiningTooltip,
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
    const { poolsWithFarms, userPools } = usePools();

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
    //const pool = computed(() => poolQuery.data.value);
    const pool = computed(() => {
      const poolWithFarm = poolsWithFarms.value.find(
        poolWithFarm => poolWithFarm.id === (route.params.id as string)
      );
      const userPool = userPools.value.find(
        poolWithFarm => poolWithFarm.id === (route.params.id as string)
      );

      if (!poolQuery.data.value) {
        return undefined;
      }

      return {
        ...poolQuery.data.value,
        dynamic: poolWithFarm
          ? poolWithFarm.dynamic
          : poolQuery.data.value.dynamic,
        hasLiquidityMiningRewards: !!poolWithFarm,
        farm: poolWithFarm?.farm,
        shares: userPool?.shares
      };
    });
    const { isStableLikePool, isLiquidityBootstrappingPool } = usePool(
      poolQuery.data
    );

    const noInitLiquidity = computed(
      () =>
        !loadingPool.value &&
        pool.value &&
        Number(pool.value.onchain.totalSupply) === 0
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
      const feeLabel = `${fNum(pool.value.onchain.swapFee, 'percent')}`;

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
        return !pool.value.tokenAddresses.every(token =>
          tokensWithPrice.includes(token)
        );
      }
      return false;
    });

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
      feesManagedByGauntlet,
      swapFeeToolTip,
      isStableLikePool,
      isLiquidityBootstrappingPool,
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
