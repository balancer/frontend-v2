<template>
  <div class="lg:container lg:mx-auto pt-10 md:pt-12">
    <div class="px-4">
      <h3>{{ title }}</h3>
      <span class="text-black-600">{{ description }}</span>
      <LMTable
        :is-loading="isLoadingPools || isLoadingPoolsIdle"
        :poolMetadata="pools"
        :weeks="distributions"
      />
      <div class="mt-20">
        <h4 class="font-bold">About liquidity mining</h4>
        <p class="mt-2">
          Liquidity mining is a form of ‘yield farming’ used to align incentives
          between a protocol and its community. Typically, DeFi protocols
          distribute tokens to users who perform certain activities which help
          the network grow.<br /><br />
          The Balancer protocol via the community Ballers, has allocated BAL
          tokens to go to liquidity providers in certain eligible pools (as
          listed in the tables above). Tokens are distributed proportional to
          the amount of liquidity each address contributed, relative to the
          total liquidity in eligible Balancer pools. BAL tokens represent an
          ownership stake in the platform and voting rights in community
          governance. In addition, other protocols like Polygon are further
          incentivizing liquidity by also distributing MATIC tokens to Balancer
          liquidity providers in certain pools on Polygon.
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
              BAL allocations and pool eligibility are determined weekly by the
              community ‘Ballers’.
            </li>
          </ul>
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
import { flatten, takeRight, uniq } from 'lodash';
import { Network } from '@/constants/network';

type TokenDistribution = {
  tokenAddress: string;
  amount: number;
}[];

type PoolDistribution = {
  chainId: number;
  pools: Record<string, TokenDistribution[]>;
};

type LiquidityMiningDistribution = Record<string, PoolDistribution[]>;

const NETWORK = process.env.VUE_APP_NETWORK || '1';

export type WeeklyDistributions = {
  week: string;
  distributions: TokenDistribution[];
};

export default defineComponent({
  components: {
    LMTable
  },
  setup() {
    // seperate variable to type the JSON
    const weeks = (LiquidityMiningDistributions as unknown) as LiquidityMiningDistribution;

    // only concerned with past 3 weeks
    const distributions = takeRight(Object.keys(weeks), 3).map(week => ({
      week: week,
      distributions: weeks[week]
        .filter(d => d.chainId === Number(NETWORK))
        .map(d => d.pools)[0]
    }));

    const poolIds = computed(() =>
      uniq(flatten(distributions.map(d => Object.keys(d.distributions))))
    );

    // there shouldn't be too many pools for the LM distribution for each chain
    // so we won't need to get a paginated response, just get all
    const {
      data: poolsResponse,
      isLoading: isLoadingPools,
      isIdle: isLoadingPoolsIdle
    } = usePoolsQuery(undefined, {}, { poolIds, pageSize: 1000 });

    const pools = computed(() => poolsResponse.value?.pages);

    const title = computed(() => {
      if (Number(NETWORK) === Network.MAINNET) {
        return 'Ethereum Network';
      }
      if (Number(NETWORK) === Network.POLYGON) {
        return 'Polygon Network';
      }
      return 'Unknown Network';
    });

    const description = computed(() => {
      if (Number(NETWORK) === Network.MAINNET) {
        return `BAL distributions on Ethereum can be claimed weekly by tapping the
        liquidity mining claim tool in the header.`;
      }
      if (Number(NETWORK) === Network.POLYGON) {
        return `BAL distributions on Polygon are automatically airdropped to eligible
        addresses weekly.`;
      }
      return '';
    });

    return {
      distributions,
      pools,
      title,
      description,
      isLoadingPools,
      isLoadingPoolsIdle
    };
  }
});
</script>
