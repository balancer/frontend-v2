<template>
  <div class="lg:container lg:mx-auto pt-12 md:pt-12">
    <PortfolioHeader
      :data="portfolio"
      :is-loading="isLoadingPortfolio || isLoadingPools || isLoadingFarms"
      :pools="poolsWithUserInFarm"
    />
    <div
      class="grid grid-cols-1 xl:grid-cols-4 gap-y-8 gap-x-0 xl:gap-x-8 mb-16"
    >
      <div class="col col-span-1">
        <PortfolioAssetsPieChart
          :assets="portfolio.tokens"
          :is-loading="isLoadingPortfolio"
        />
      </div>
      <div class="col col-span-3">
        <PortfolioValueLineChart
          :assets="portfolio.tokens"
          :data="portfolioHistory"
          :is-loading="isLoadingPortfolio"
        />
      </div>
    </div>
    <div class="px-4 lg:px-0">
      <h2 class="mb-6 text-green-500">My Investments</h2>
    </div>
    <div
      class="grid grid-cols-1 xl:grid-cols-4 gap-y-8 gap-x-0 xl:gap-x-8 mb-12"
    >
      <div class="col-span-3">
        <PortfolioPoolsStatCards
          :pools="portfolio.pools"
          :is-loading="isLoadingPortfolio"
        />
        <div>
          <PortfolioStatWithBarChart
            title="Fees Earned (24h)"
            :sub-title="`Avg: ${fNum(avgFees, 'usd')}/day`"
            :stat="fNum(portfolio.myFees, 'usd')"
            info-text="The swap fees you've earned as a liquidity provider. 'Fees Earned (24h)' are the fees you've earned in the last 24 hours. The bar chart to the right shows the daily fees you've earned. Daily snapshots are taken at 00:00 UTC."
            :dates="timestamps"
            :data="fees"
            :bar-color="chartColors[2]"
            :is-loading="isLoadingPortfolio"
          />
        </div>
      </div>
      <div>
        <PortfolioPoolsPieChart
          :pools="portfolio.pools"
          :is-loading="isLoadingPortfolio"
        />
      </div>
    </div>
    <template v-if="isWalletReady && userPoolList.length > 0">
      <h4 class="mb-4">My Investment Pools</h4>
      <PoolsTable
        :isLoading="userPoolDataLoading"
        :data="userPoolList"
        :noPoolsLabel="$t('noInvestments')"
        showPoolShares
        class="mb-8"
      />
      <div class="mb-12" />
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, watch } from 'vue';
import { useRouter } from 'vue-router';
import { EXTERNAL_LINKS } from '@/constants/links';
import PoolsTable from '@/components/tables/PoolsTable/PoolsTable.vue';
import usePools from '@/composables/pools/usePools';
import useWeb3 from '@/services/web3/useWeb3';
import PortfolioAssetsPieChart from '@/beethovenx/components/pages/portfolio/PortfolioAssetsPieChart.vue';
import PortfolioPoolsPieChart from '@/beethovenx/components/pages/portfolio/PortfolioPoolsPieChart.vue';
import PortfolioValueLineChart from '@/beethovenx/components/pages/portfolio/PortfolioValueLineChart.vue';
import PortfolioStatWithBarChart from '@/beethovenx/components/pages/portfolio/PortfolioStatWithBarChart.vue';
import { chartColors } from '@/beethovenx/constants/colors';
import PortfolioHeader from '@/beethovenx/components/pages/portfolio/PortfolioHeader.vue';
import { orderBy, sum } from 'lodash';
import useNumbers from '@/composables/useNumbers';
import PortfolioPoolsStatCards from '@/beethovenx/components/pages/portfolio/PortfolioPoolsStatCards.vue';
import usePortfolio from '@/beethovenx/composables/usePortfolio';
import useUserPoolData from '@/beethovenx/composables/useUserPoolData';

export default defineComponent({
  components: {
    PortfolioPoolsStatCards,
    PortfolioHeader,
    PortfolioPoolsPieChart,
    PortfolioStatWithBarChart,
    PortfolioValueLineChart,
    PortfolioAssetsPieChart,
    PoolsTable
  },

  setup() {
    // COMPOSABLES
    const router = useRouter();
    const { isWalletReady, account } = useWeb3();

    const {
      onlyPoolsWithFarms,
      isLoadingPools,
      isLoadingFarms,
      loadMorePools,
      poolsHasNextPage,
      poolsIsFetchingNextPage
    } = usePools();
    const { portfolio, portfolioHistory, isLoadingPortfolio } = usePortfolio();
    const { userPoolList, userPoolDataLoading } = useUserPoolData();

    const { fNum } = useNumbers();

    const poolsWithUserInFarm = computed(() => {
      return onlyPoolsWithFarms.value.filter(
        pool => pool.decoratedFarm.stake > 0
      );
    });

    const timestamps = computed(() =>
      orderBy(portfolioHistory.value, 'timestamp', 'asc').map(
        item => item.timestamp
      )
    );

    const volume = computed(() =>
      orderBy(portfolioHistory.value, 'timestamp', 'asc').map(
        item => item.totalSwapVolume
      )
    );
    const fees = computed(() =>
      orderBy(portfolioHistory.value, 'timestamp', 'asc').map(
        item => item.myFees
      )
    );
    const avgFees = computed(() => sum(fees.value) / fees.value.length);

    watch(account, () => {
      if (!account.value) {
        router.push({ name: 'home' });
      }
    });

    return {
      // data
      poolsWithUserInFarm,
      isLoadingPools,
      isLoadingFarms,

      // computed
      isWalletReady,
      poolsHasNextPage,
      poolsIsFetchingNextPage,

      portfolio,
      portfolioHistory,
      isLoadingPortfolio,

      //methods
      router,
      loadMorePools,
      chartColors,
      timestamps,
      fees,
      volume,
      fNum,
      avgFees,
      userPoolList,
      userPoolDataLoading,

      // constants
      EXTERNAL_LINKS
    };
  }
});
</script>
