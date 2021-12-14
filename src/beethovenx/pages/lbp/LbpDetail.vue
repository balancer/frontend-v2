<script setup lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { useQueryClient } from 'vue-query';
import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import {
  POOLS_ROOT_KEY,
  SWAPS_ROOT_KEY,
  TOKEN_PRICES_ROOT_KEY
} from '@/beethovenx/constants/queryKeys';
import useTokenLists from '@/composables/useTokenLists';
import {
  format,
  getUnixTime,
  isAfter,
  isBefore,
  parseISO,
  subDays
} from 'date-fns';
import useSubgraphTokenPricesQuery from '@/beethovenx/composables/queries/useSubgraphTokenPricesQuery';
import { LBPDefaultData } from '@/beethovenx/lbp/composables/useLbpState';
import LbpTradeCard from '@/beethovenx/lbp/components/LbpTradeCard.vue';
import LbpStatCards from '@/beethovenx/lbp/components/LbpStatCards.vue';
import LbpTable from '@/beethovenx/lbp/components/LbpTable.vue';
import useLbpAuctionState from '@/beethovenx/lbp/composables/useLbpAuctionState';
import LbpDetailWarning from '@/beethovenx/lbp/components/LbpDetailWarning.vue';
import LbpChart from '@/beethovenx/lbp/components/LbpChart.vue';

const {
  data,
  startDateTimeFormatted,
  endDateTimeFormatted,
  startsAt,
  endsAt,
  isBeforeStart,
  isAfterEnd,
  refreshStartEndStatus,
  refetchQueriesOnBlockNumber,
  invalidateQueries,
  poolId,
  poolAddress,
  collateralToken,
  launchToken
} = useLbpAuctionState();

/**
 * COMPOSABLES
 */
const { appLoading } = useApp();
const { blockNumber } = useWeb3();

const poolQuery = usePoolQuery(poolId.value);
const loadingPool = computed(
  () =>
    poolQuery.isLoading.value || poolQuery.isIdle.value || poolQuery.error.value
);
const pool = computed(() => {
  return poolQuery.data.value;
});
const enabled = computed(() => !!pool.value?.id);
const swapEnabled = computed(() => poolQuery.data.value?.swapEnabled);

/**
 * WATCHERS
 */
watch(blockNumber, () => {
  refreshStartEndStatus();

  if (refetchQueriesOnBlockNumber.value === blockNumber.value) {
    invalidateQueries();
  } else {
    poolQuery.refetch.value();
    //tokenPricesQuery.refetch.value();
  }
});
</script>

<template>
  <div
    v-if="isBeforeStart || isAfterEnd"
    :class="[
      'app-nav-alert text-white',
      isBeforeStart ? 'bg-green-500' : 'bg-red-500'
    ]"
  >
    <div class="w-8" />
    <div class="flex-1 text-center flex items-center justify-center">
      <span class="font-semibold text-black">
        {{ data.name }} Liquidity Bootstrapping Event
        {{ isBeforeStart ? ' starts' : ' ended' }}:
        {{ `${isBeforeStart ? startDateTimeFormatted : endDateTimeFormatted}` }}
      </span>
    </div>
  </div>

  <div class="lg:container lg:mx-auto">
    <LbpDetailWarning />
    <div
      class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8 mt-12"
    >
      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div>
            <h2 class="text mb-2 text-4xl">{{ data.name }}</h2>
          </div>
          <div class="px-1 lg:px-0">
            <LbpChart
              :loading="loadingTokenPrices || loadingPool"
              :pool="pool"
            />
          </div>
          <div class="mb-4 px-1 lg:px-0">
            <LbpStatCards />

            <p class="text-gray-300 mt-4">
              *The predicted price is an estimation assuming no additional
              buyers or sellers.
            </p>
            <p class="text-gray-300">
              <span class="font-bold">Note</span>: Users can both
              <span class="font-bold text-green-500">BUY</span> and
              <span class="font-bold text-red-500">SELL</span>
              during this event. Please be careful.
            </p>
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2 px-1 lg:px-0 pt-16">
        <div class="mb-6">
          <img src="~@/beethovenx/assets/images/ludwig-says.svg" />
        </div>

        <div class="pt-2">
          <BalLoadingBlock
            v-if="appLoading || loadingTokenLists"
            class="h-96"
          />
          <template v-else>
            <LbpTradeCard :swap-enabled="swapEnabled" @on-tx="onNewTx" />
          </template>
        </div>
      </div>
    </div>

    <div class="mt-24 mb-24">
      <!--      <LbpTable
        :lbp-token-name="lbpTokenName"
        :lbp-token-address="lbpTokenAddress"
        :lbp-pool-id="lbpPoolId"
      />-->
    </div>
  </div>
</template>
