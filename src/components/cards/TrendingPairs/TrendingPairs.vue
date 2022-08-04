<script setup lang="ts">
import { getAddress } from '@ethersproject/address';
import { getUnixTime } from 'date-fns';
import { computed } from 'vue';
import { useQuery } from 'vue-query';

import { useTradeState } from '@/composables/trade/useTradeState';
import useBreakpoints from '@/composables/useBreakpoints';
import QUERY_KEYS from '@/constants/queryKeys';
import { balancerSubgraphService } from '@/services/balancer/subgraph/balancer-subgraph.service';
import useWeb3 from '@/services/web3/useWeb3';

type TrendingPair = {
  symbol: string;
  address: string;
};

const { setTokenOutAddress, setTokenInAddress } = useTradeState();
const { chainId: userNetworkId, appNetworkConfig } = useWeb3();
const { upToLargeBreakpoint } = useBreakpoints();

const getTrendingTradePairs = async () => {
  return await balancerSubgraphService.tradePairSnapshots.get({
    orderBy: 'totalSwapVolume',
    orderDirection: 'desc',
    where: {
      timestamp_gte: getUnixTime(new Date().setUTCHours(0, 0, 0, 0)),
    },
    first: 6,
  });
};

const { data: tradePairSnapshots } = useQuery(
  QUERY_KEYS.Tokens.TrendingPairs(userNetworkId),
  () => getTrendingTradePairs()
);

function formatToken({ address, symbol }: { address: string; symbol: string }) {
  const formatted = getAddress(address);

  if (formatted === appNetworkConfig.addresses.weth) {
    return {
      address: appNetworkConfig.nativeAsset.address,
      symbol: appNetworkConfig.nativeAsset.symbol,
    };
  }

  return {
    address: formatted,
    symbol,
  };
}

const trendingPairs = computed(() => {
  return (tradePairSnapshots.value || []).map(pairSnapshot => [
    formatToken(pairSnapshot.pair.token0),
    formatToken(pairSnapshot.pair.token1),
  ]);
});

const setTradePair = (pair: TrendingPair[]) => {
  setTokenInAddress(pair[0].address);
  setTokenOutAddress(pair[1].address);
};
</script>

<template>
  <BalCard
    :square="upToLargeBreakpoint"
    noPad
    growContent
    :noBorder="upToLargeBreakpoint"
    shadow="none"
  >
    <div class="trending-pairs">
      <div
        v-if="!upToLargeBreakpoint"
        class="flex justify-between p-3 lg:border-b dark:border-gray-700"
      >
        <h6>{{ $t('trendingPairs') }}</h6>
      </div>
      <div class="flex flex-wrap gap-3 lg:p-3 px-1">
        <button
          v-for="(pair, i) in trendingPairs"
          :key="`trendingPair-${i}`"
          class="py-1 px-2 text-sm font-medium lg:font-normal hover:text-white bg-transparent hover:bg-blue-500 dark:hover:bg-blue-400 rounded-lg border dark:border-gray-800 shadow-sm transition-colors"
          @click="setTradePair(pair)"
        >
          {{ pair[0].symbol }} <span class="relative -top-px text-xs">-></span>
          {{ pair[1].symbol }}
        </button>
      </div>
    </div>
  </BalCard>
</template>

<style scoped>
.trending-pairs {
  @apply flex flex-col bg-transparent;

  min-height: 200px;
}
</style>
