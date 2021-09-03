<template>
  <div>
    <div class="lm-banner h-48 flex items-center justify-center flex-col">
      <span class="text-white font-semibold"
        >Week {{ currentWeek }} Liquidity mining incentives</span
      >
      <h1 class="font-body mt-2 text-white font-semi bold">
        ~{{ fNum(currentWeekTotalFiat, 'usd') }}
      </h1>
    </div>
    <div class="lg:container lg:mx-auto pt-10 md:pt-12">
      <div class="px-4">
        <h3 class="mb-1">Liquidity mining on {{ shortNetworkName }}</h3>
        <span class="text-black-600">{{ description }}</span>
      </div>
      <div class="md:px-4">
        <LMTable
          :is-loading="isLoadingPools || isLoadingPoolsIdle"
          :poolMetadata="pools"
          :weeks="weeks"
          :totals="totals"
        />
      </div>
      <div class="px-4">
        <div class="flex flex-col">
          <span class="font-medium mb-1 mt-8"
            >Liquidity Mining is also on {{ otherNetwork }}</span
          >

          <BalLink external>
            <a :href="otherNetworkLink">
              <div class="flex items-center">
                View {{ otherNetwork }} liquidity mining incentives
                <BalIcon name="arrow-right" />
              </div>
            </a>
          </BalLink>
        </div>
        <div class="mt-12 max-w-6xl">
          <h4 class="font-bold">About liquidity mining</h4>
          <p class="mt-2">
            Many DeFi protocols distribute tokens to users who perform certain
            activities that help the network grow. Liquidity Mining aligns
            incentives between a protocol and its community by distributing
            voting power to the people who help create a more liquid market.<br /><br />The
            Balancer Protocol, via the community Ballers, has allocated BAL
            tokens to go to Liquidity Providers in certain eligible pools (as
            listed in the tables above). Tokens are distributed proportional to
            the amount of liquidity each address contributed, relative to the
            total liquidity in eligible Balancer pools. BAL tokens give voting
            rights in community governance. In addition, other protocols may
            further incentivize liquidity by also distributing tokens to
            Balancer Liquidity Providers in certain pools.
          </p>
          <div class="mt-6">
            <h5>Liquidity mining details</h5>
            <ul class="mt-2 pl-8 list-disc">
              <li class="mt-2">
                You’re eligible to receive token distributions if you add
                liquidity to any of the eligible pools.
              </li>
              <li class="mt-2">
                Liquidity mining weeks start and end at 00:00 UTC on Mondays.
              </li>
              <li class="mt-2">
                BAL allocations and pool eligibility are determined weekly by
                the community ‘Ballers’.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import LMTable from '@/components/tables/LMTable/LMTable.vue';
import LiquidityMiningDistributions from '@/lib/utils/liquidityMining/MultiTokenLiquidityMining.json';
import usePoolsQuery from '@/composables/queries/usePoolsQuery';
import { flatten, last, takeRight, uniq } from 'lodash';
import { Network } from '@/constants/network';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { getAddress } from '@ethersproject/address';
import useConfig from '@/composables/useConfig';

type TokenDistribution = {
  tokenAddress: string;
  amount: number;
};

type PoolDistribution = {
  chainId: number;
  pools: Record<string, TokenDistribution[]>;
};

export type TokenTotal = { token: string; total: number };

type LiquidityMiningDistribution = Record<string, PoolDistribution[]>;

export type WeeklyDistributions = {
  week: string;
  distributions: TokenDistribution[];
};

export default defineComponent({
  components: {
    LMTable
  },
  setup() {
    const { fNum } = useNumbers();
    const { priceFor } = useTokens();
    const { networkConfig } = useConfig();

    // seperate variable to type the JSON
    const weeksJSON = (LiquidityMiningDistributions as unknown) as LiquidityMiningDistribution;

    const totals = computed(() => {
      // map tracking a list of token totals for each week
      const weeklyTotals: Record<string, TokenTotal[]> = {};
      for (const week of weeks) {
        // map tracking totals for each token
        const tokenTotals: Record<string, TokenTotal> = {};
        // this will be an array of pools with their token distributions,
        // we just want the values, not the pool id
        const distributions = Object.values(week.distributions);
        for (const distribution of distributions) {
          for (const allocation of distribution) {
            if (!tokenTotals[allocation.tokenAddress]) {
              tokenTotals[allocation.tokenAddress] = {
                token: allocation.tokenAddress,
                total: allocation.amount
              };
              continue;
            } else {
              tokenTotals[allocation.tokenAddress].total =
                tokenTotals[allocation.tokenAddress].total + allocation.amount;
            }
          }
        }
        weeklyTotals[week.week] = Object.values(tokenTotals);
      }
      return weeklyTotals;
    });

    const currentWeekTotalFiat = computed(() => {
      let totalFiat = 0;
      const currentWeek = last(Object.values(totals.value));
      if (currentWeek) {
        for (const total of currentWeek) {
          const fiatValue = priceFor(getAddress(total.token)) * total.total;
          totalFiat = totalFiat + fiatValue;
        }
      }
      return totalFiat;
    });

    // only concerned with past 3 weeks
    const weeks = takeRight(Object.keys(weeksJSON), 3).map(week => ({
      week: week,
      distributions: weeksJSON[week]
        .filter(d => d.chainId === networkConfig.chainId)
        .map(d => d.pools)[0]
    }));

    const poolIds = computed(() =>
      uniq(flatten(weeks.map(d => Object.keys(d.distributions))))
    );

    // there shouldn't be too many pools for the LM distribution for each chain
    // so we won't need to get a paginated response, just get all
    const {
      data: poolsResponse,
      isLoading: isLoadingPools,
      isIdle: isLoadingPoolsIdle
    } = usePoolsQuery(undefined, {}, { poolIds, pageSize: 1000 });

    const pools = computed(() => poolsResponse.value?.pages);

    const shortNetworkName = computed(() => {
      if (networkConfig.chainId === Network.MAINNET) {
        return 'Ethereum';
      }
      if (networkConfig.chainId === Network.POLYGON) {
        return 'Polygon';
      }
      if (networkConfig.chainId === Network.ARBITRUM) {
        return 'Arbitrum';
      }
      return 'Unknown Network';
    });

    const description = computed(() => {
      if (networkConfig.chainId === Network.MAINNET) {
        return `BAL distributions on Ethereum can be claimed weekly by tapping the
        liquidity mining claim tool in the header.`;
      }
      if (networkConfig.chainId === Network.POLYGON) {
        return `BAL distributions on Polygon are automatically airdropped to eligible
        addresses weekly.`;
      }
      if (networkConfig.chainId === Network.ARBITRUM) {
        return `BAL distributions on Arbitrum are automatically airdropped to eligible
        addresses weekly.`;
      }
      return '';
    });

    const currentWeek = computed(() => last(last(weeks)?.week.split('_')));
    const otherNetwork = computed(() => {
      if (networkConfig.chainId === Network.MAINNET) return 'Polygon';
      if (networkConfig.chainId === Network.POLYGON) return 'Ethereum';
      if (networkConfig.chainId === Network.ARBITRUM) return 'Ethereum';
      return 'Ethereum';
    });

    const otherNetworkLink = computed(() => {
      let networkDomain = 'app';
      if (networkConfig.chainId === Network.MAINNET) {
        networkDomain = 'polygon';
      }
      return `https://${networkDomain}.balancer.fi/#/liquidity-mining`;
    });

    return {
      weeks,
      pools,
      shortNetworkName,
      totals,
      description,
      isLoadingPools,
      isLoadingPoolsIdle,
      currentWeek,
      currentWeekTotalFiat,
      fNum,
      otherNetwork,
      otherNetworkLink
    };
  }
});
</script>

<style>
.lm-banner {
  @apply bg-cover bg-center;
  background-image: url('/images/backgrounds/bg-header.svg');
}
</style>
