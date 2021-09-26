<template>
  <BalCard noPad hFull noShadow>
    <div class="flex flex-col bg-white widget-card">
      <div class="flex justify-between p-3 shadow-lg">
        <h6>Trending Pairs</h6>
      </div>
      <div class="p-3 flex flex-wrap">
        <button
          class="py-1 px-2 bg-gray-50 rounded-lg shadow mb-2 mr-2"
          v-for="(pair, i) in trendingPairs"
          :key="`trendingPair-${i}`"
        >
          {{ pair[0] }}/{{ pair[1] }}
        </button>
      </div>
    </div>
  </BalCard>
</template>

<script lang="ts">
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import { startOfDay } from 'date-fns';
import { computed, defineComponent, reactive } from 'vue';
import { useQuery } from 'vue-query';

const getTrendingTradePairs = async () => {
  return await balancerSubgraphService.tradePairSnapshots.get({
    orderBy: 'swapVolume',
    orderDirection: 'desc',
    where: {
      timestamp_gte: startOfDay(new Date()).getTime() / 1000
    },
    first: 5
  });
};

export default defineComponent({
  setup() {
    const { data: tradePairSnapshots } = useQuery(
      reactive(['trendingTradePairs']),
      () => getTrendingTradePairs()
    );
    const trendingPairs = computed(() => {
      return (tradePairSnapshots.value || []).map(pairSnapshot => [
        pairSnapshot.pair.token0.symbol,
        pairSnapshot.pair.token1.symbol
      ]);
    });

    return {
      trendingPairs
    };
  }
});
</script>
