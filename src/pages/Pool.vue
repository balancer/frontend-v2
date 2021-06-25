<template>
  <div class="container mx-auto px-4 lg:px-0 pt-8">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8">
      <div class="col-span-2">
        <BalLoadingBlock v-if="loadingPool" class="h-16" />
        <div v-else class="flex flex-col">
          <div class="flex flex-wrap items-center -mt-2">
            <h3 class="font-bold mr-4 capitalize mt-2">
              {{ poolTypeLabel }}
            </h3>
            <div
              v-for="([address, tokenMeta], i) in titleTokens"
              :key="i"
              class="mt-2 mr-2 flex items-center px-2 h-10 bg-gray-50 rounded-lg"
            >
              <BalAsset :address="address" :size="24" />
              <span class="ml-2">
                {{ tokenMeta.symbol }}
              </span>
              <span class="font-medium text-gray-400 text-xs mt-px ml-1">
                {{ fNum(tokenMeta.weight, 'percent_lg') }}
              </span>
            </div>
            <LiquidityMiningTooltip :pool="pool" class="-ml-1 mt-2" />
          </div>
          <div class="flex items-center mt-2">
            <div v-html="poolFeeLabel" class="text-sm text-gray-600" />
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
              <div class="w-52">
                <span>
                  {{ swapFeeToolTip }}
                </span>
              </div>
            </BalTooltip>
          </div>
        </div>

        <BalAlert
          v-if="!appLoading && missingPrices"
          type="warning"
          :title="$t('noPriceInfo')"
          size="sm"
          class="mt-2"
        />
        <BalAlert
          v-if="!appLoading && noInitLiquidity"
          type="warning"
          :title="$t('noInitLiquidity')"
          :description="$t('noInitLiquidityDetail')"
          size="sm"
          class="mt-2"
        />
      </div>

      <div class="hidden lg:block" />

      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <PoolChart
            :prices="historicalPrices"
            :snapshots="snapshots"
            :loading="isLoadingSnapshots"
          />

          <PoolStatCards :pool="pool" :loading="loadingPool" />

          <div>
            <h4 v-text="$t('poolComposition')" class="mb-4" />
            <PoolBalancesCard :pool="pool" :loading="loadingPool" />
          </div>

          <div>
            <h4 v-text="$t('poolTransactions')" class="mb-4" />
            <PoolActivitiesCard :pool="pool" :loading="loadingPool" />
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2">
        <BalLoadingBlock v-if="loadingPool" class="h-96 sticky top-24" />
        <PoolActionsCard
          v-else-if="!noInitLiquidity"
          :pool="pool"
          :missing-prices="missingPrices"
          @on-tx="onNewTx"
          class="sticky top-24"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs, computed, watch } from 'vue';
import * as PoolPageComponents from '@/components/pages/pool';
import GauntletIcon from '@/components/images/icons/GauntletIcon.vue';
import LiquidityMiningTooltip from '@/components/tooltips/LiquidityMiningTooltip.vue';

import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useQueryClient } from 'vue-query';

import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import usePoolSnapshotsQuery from '@/composables/queries/usePoolSnapshotsQuery';
import { useRouter } from 'vue-router';

import { POOLS_ROOT_KEY } from '@/constants/queryKeys';
import { POOLS } from '@/constants/pools';
import { EXTERNAL_LINKS } from '@/constants/links';
import useVueWeb3 from '@/services/web3/useVueWeb3';

interface PoolPageData {
  id: string;
  refetchQueriesOnBlockNumber: number;
}

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default defineComponent({
  components: {
    ...PoolPageComponents,
    GauntletIcon,
    LiquidityMiningTooltip
  },

  setup() {
    // COMPOSABLES
    const store = useStore();
    const router = useRouter();
    const { t } = useI18n();
    const route = useRoute();
    const { fNum } = useNumbers();
    const { isWalletReady } = useVueWeb3();
    const queryClient = useQueryClient();
    const poolQuery = usePoolQuery(route.params.id as string);
    const poolSnapshotsQuery = usePoolSnapshotsQuery(
      route.params.id as string,
      30
    );

    const { blockNumber } = useVueWeb3();

    // DATA
    const data = reactive<PoolPageData>({
      id: route.params.id as string,
      refetchQueriesOnBlockNumber: 0
    });

    // COMPUTED
    const appLoading = computed(() => store.state.app.loading);

    const pool = computed(() => poolQuery.data.value);

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

    const loadingPool = computed(
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
      const feeLabel = fNum(pool.value.onchain.swapFee, 'percent');

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
        const tokensWithPrice = Object.keys(store.state.market.prices);
        return !pool.value.tokensList.every(token =>
          tokensWithPrice.includes(token)
        );
      }
      return false;
    });

    // METHODS
    function onNewTx(): void {
      queryClient.invalidateQueries([POOLS_ROOT_KEY, 'current', data.id]);
      data.refetchQueriesOnBlockNumber =
        blockNumber.value + REFETCH_QUERIES_BLOCK_BUFFER;
    }

    // WATCHERS
    watch(blockNumber, () => {
      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      } else {
        poolQuery.refetch.value();
      }
    });

    watch(poolQuery.error, () => {
      router.push({ name: 'home' });
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
      // methods
      fNum,
      onNewTx
    };
  }
});
</script>
