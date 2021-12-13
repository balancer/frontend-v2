<template>
  <!--  <div v-if="isBeforeLbpStart" class="app-nav-alert bg-green-500 text-white">
    <div class="w-8" />
    <div class="flex-1 text-center flex items-center justify-center">
      <BalIcon name="clock" class="mr-4" />

      <span class="font-semibold"
        >BEETS Liquidity Bootstrapping Event starts:
        {{ startDateTimeFormatted }}</span
      >
    </div>
  </div>-->
  <div class="lg:container lg:mx-auto mt-12">
    <!--    <template v-if="isLbpOver">
      <div class="mx-8">
        <div class="lg:-ml-5 mt-8">
          <img src="~@/assets/images/beets-lbp-headline.svg" class="mx-auto" />
        </div>
        <h3 class="text-center mt-8">
          The event has come to an end, thanks so much for participating!
        </h3>
        <div class="flex justify-center mt-12 mb-12">
          <img src="~@/assets/images/looking-image.png" width="400" />
        </div>
        <h3 class="lg:mx-64 text-center mb-24">
          We're migrating liquidity to the permanent 80/20 pool and then locking
          it. Come join us in
          <a href="https://discord.gg/jedS4zGk28" class="text-red-500 underline"
            >Discord</a
          >
          or follow us on
          <a
            href="https://twitter.com/beethoven_x"
            class="text-red-500 underline"
            >Twitter</a
          >
          to stay up to date. Farming will begin soon.
        </h3>
      </div>
    </template>-->
    <div
      class="grid grid-cols-1 lg:grid-cols-3 gap-y-8 gap-x-0 lg:gap-x-8 mt-8"
    >
      <div class="col-span-2 order-2 lg:order-1">
        <div class="grid grid-cols-1 gap-y-8">
          <div>
            <h2 class="text-red-500 mb-2">BEETS</h2>
            <!--            <div class="lg:-ml-5 lg:-mt-4">
              <img src="~@/assets/images/beets-headline.svg" />
            </div>-->
            <!--            <p class="font-medium">
              Before participating, please read our blog post explaining
              Liquidity Bootstrapping Pools
              <a
                href="https://beethovenxio.medium.com/drop-the-beets-ebf8c61c898"
                class="text-red-500 underline"
                >here</a
              >.
            </p>-->
          </div>
          <div class="px-1 lg:px-0">
            <BeetsLBPChart
              :loading="loadingTokenPrices || loadingPool"
              :lbp-token-name="lbpTokenName"
              :lbp-token-address="lbpTokenAddress"
              :lbp-pool-id="lbpPoolId"
              :lbp-end-time="lbpEndTime"
              :lbp-start-time="lbpStartTime"
              :token-prices="tokenPrices"
              :usdc-address="usdcAddress"
              :weight-step="lbpWeightStep"
              :time-step="lbpTimeStep"
              :pool="pool"
            />
          </div>
          <div class="mb-4 px-1 lg:px-0">
            <BeetsLBPStatCards
              :pool="pool"
              :lbp-token-address="lbpTokenAddress"
              :lbp-token-name="lbpTokenName"
              :lbp-token-starting-amount="lbpTokenStartingAmount"
              :usdc-address="usdcAddress"
              :lbp-end-time="lbpEndTime"
              :lbp-start-time="lbpStartTime"
              :loading="loadingPool"
              :lbp-pool-id="lbpPoolId"
              :is-before-lbp-start="isBeforeLbpStart"
              @lbpStateChange="handleLbpStateChange"
            />

            <!--            <p class="text-gray-300 mt-4">
              *The predicted price is an estimation assuming no additional
              buyers or sellers.
            </p>
            <p class="text-gray-300">
              <span class="font-bold">Note</span>: Users can both
              <span class="font-bold text-green-500">BUY</span> and
              <span class="font-bold text-red-500">SELL</span>
              during this event. Please be careful.
            </p>-->
          </div>
        </div>
      </div>

      <div class="order-1 lg:order-2 px-1 lg:px-0 pt-16">
        <!--        <div class="mb-6">
          <img src="~@/assets/images/ludwig-says.svg" />
        </div>-->

        <div class="pt-2">
          <BalLoadingBlock
            v-if="appLoading || loadingTokenLists"
            class="h-96"
          />
          <template v-else>
            <LBPTradeCard
              :lbp-token-name="lbpTokenName"
              :lbp-token-address="lbpTokenAddressFormatted"
              :usdc-address="usdcAddressFormatted"
              :swap-enabled="swapEnabled"
              @on-tx="onNewTx"
            />
          </template>
        </div>
      </div>
    </div>

    <div class="mt-24 mb-24">
      <LBPTable
        :lbp-token-name="lbpTokenName"
        :lbp-token-address="lbpTokenAddress"
        :lbp-pool-id="lbpPoolId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from 'vue';
import { useQueryClient } from 'vue-query';
import useNumbers from '@/composables/useNumbers';
import usePoolQuery from '@/composables/queries/usePoolQuery';
import { EXTERNAL_LINKS } from '@/constants/links';
import useWeb3 from '@/services/web3/useWeb3';
import useApp from '@/composables/useApp';
import BeetsLBPChart from '@/components/pages/lbp/BeetsLBPChart.vue';
import BeetsLBPStatCards from '@/components/pages/lbp/BeetsLBPStatCards.vue';
import LBPTradeCard from '@/components/cards/LBPTradeCard/LBPTradeCard.vue';
import LBPTable from '@/components/tables/LBPTable/LBPTable.vue';
import {
  POOLS_ROOT_KEY,
  SWAPS_ROOT_KEY,
  TOKEN_PRICES_ROOT_KEY
} from '@/beethovenx/constants/queryKeys';
import useTokenLists from '@/composables/useTokenLists';
import {
  format,
  isAfter,
  isBefore,
  parseISO,
  getUnixTime,
  subDays
} from 'date-fns';
import useSubgraphTokenPricesQuery from '@/beethovenx/composables/queries/useSubgraphTokenPricesQuery';

interface LbpPageData {
  refetchQueriesOnBlockNumber: number;
}

const REFETCH_QUERIES_BLOCK_BUFFER = 3;

export default defineComponent({
  components: {
    BeetsLBPChart,
    BeetsLBPStatCards,
    LBPTradeCard,
    LBPTable
  },

  setup() {
    /**
     * COMPOSABLES
     */
    const { appLoading } = useApp();
    const { fNum } = useNumbers();
    const { appNetworkConfig } = useWeb3();
    const queryClient = useQueryClient();
    const { blockNumber } = useWeb3();
    const { loadingTokenLists } = useTokenLists();
    const lbpConfig = appNetworkConfig.lbp;

    const isLbpOver = ref(isAfter(new Date(), parseISO(lbpConfig.endTime)));
    const isBeforeLbpStart = ref(
      isBefore(new Date(), parseISO(lbpConfig.startTime))
    );

    const poolQuery = usePoolQuery(lbpConfig.poolId);
    const loadingPool = computed(
      () =>
        poolQuery.isLoading.value ||
        poolQuery.isIdle.value ||
        poolQuery.error.value
    );
    const pool = computed(() => {
      return poolQuery.data.value;
    });
    const enabled = computed(() => !!pool.value?.id);
    const swapEnabled = computed(() => poolQuery.data.value?.swapEnabled);

    const tokenPricesQuery = useSubgraphTokenPricesQuery(
      ref(lbpConfig.poolId),
      ref(lbpConfig.tokenAddress.toLowerCase()),
      ref(`${getUnixTime(subDays(new Date(), 1))}`)
    );
    const tokenPrices = computed(() => tokenPricesQuery.data.value || []);
    const loadingTokenPrices = computed(
      () =>
        tokenPricesQuery.isLoading.value ||
        tokenPricesQuery.isIdle.value ||
        tokenPricesQuery.error.value
    );

    const data = reactive<LbpPageData>({ refetchQueriesOnBlockNumber: 0 });

    const startDateTimeFormatted = computed(() =>
      format(parseISO(lbpConfig.startTime), 'MMM d, HH:mm')
    );

    /**
     * METHODS
     */
    function onNewTx(): void {
      isLbpOver.value = isAfter(new Date(), parseISO(lbpConfig.endTime));
      isBeforeLbpStart.value = isBefore(
        new Date(),
        parseISO(lbpConfig.startTime)
      );

      queryClient.invalidateQueries([POOLS_ROOT_KEY]);
      queryClient.invalidateQueries([
        POOLS_ROOT_KEY,
        'current',
        lbpConfig.poolId
      ]);
      queryClient.invalidateQueries([SWAPS_ROOT_KEY]);
      queryClient.invalidateQueries([TOKEN_PRICES_ROOT_KEY]);
      data.refetchQueriesOnBlockNumber =
        blockNumber.value + REFETCH_QUERIES_BLOCK_BUFFER;
    }

    /**
     * WATCHERS
     */
    watch(blockNumber, () => {
      isLbpOver.value = isAfter(new Date(), parseISO(lbpConfig.endTime));
      isBeforeLbpStart.value = isBefore(
        new Date(),
        parseISO(lbpConfig.startTime)
      );

      if (data.refetchQueriesOnBlockNumber === blockNumber.value) {
        queryClient.invalidateQueries([POOLS_ROOT_KEY]);
        queryClient.invalidateQueries([
          POOLS_ROOT_KEY,
          'current',
          lbpConfig.poolId
        ]);
        queryClient.invalidateQueries([SWAPS_ROOT_KEY]);
        queryClient.invalidateQueries([TOKEN_PRICES_ROOT_KEY]);
      } else {
        poolQuery.refetch.value();
        tokenPricesQuery.refetch.value();
      }
    });

    function handleLbpStateChange() {
      isLbpOver.value = isAfter(new Date(), parseISO(lbpConfig.endTime));
      isBeforeLbpStart.value = isBefore(
        new Date(),
        parseISO(lbpConfig.startTime)
      );
    }

    return {
      EXTERNAL_LINKS,
      appLoading,
      fNum,
      pool,
      enabled,
      lbpPoolId: lbpConfig.poolId,
      lbpTokenAddress: lbpConfig.tokenAddress.toLowerCase(),
      lbpTokenName: lbpConfig.tokenSymbol,
      lbpTokenStartingAmount: lbpConfig.startingAmount,
      lbpStartTime: lbpConfig.startTime,
      lbpEndTime: lbpConfig.endTime,
      lbpWeightStep: lbpConfig.weightStep,
      lbpTimeStep: lbpConfig.timeStep,
      usdcAddress: lbpConfig.usdcAddress.toLowerCase(),
      lbpTokenAddressFormatted: lbpConfig.tokenAddress,
      usdcAddressFormatted: lbpConfig.usdcAddress,
      loadingPool,
      tokenPrices,
      loadingTokenPrices,
      loadingTokenLists,
      swapEnabled,
      isLbpOver,
      onNewTx,
      isBeforeLbpStart,
      startDateTimeFormatted,
      handleLbpStateChange
    };
  }
});
</script>
