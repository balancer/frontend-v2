<script lang="ts" setup>
import { computed, defineComponent, PropType, ref } from 'vue';
import { useRouter } from 'vue-router';
import { FullPool, SubgraphSwap } from '@/services/balancer/subgraph/types';
import { getAddress } from '@ethersproject/address';
import useNumbers from '@/composables/useNumbers';
import { ColumnDefinition } from '@/components/_global/BalTable/BalTable.vue';
import useDarkMode from '@/composables/useDarkMode';
import useBreakpoints from '@/composables/useBreakpoints';
import { isStableLike } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import useWeb3 from '@/services/web3/useWeb3';
import { format, getUnixTime } from 'date-fns';
import { flatten, orderBy } from 'lodash';
import numeral from 'numeral';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import useLge from '@/beethovenx/lbp/composables/useLge';
import usePoolSwapsQuery from '@/composables/queries/usePoolSwapsQuery';
import useAllPoolSwapsQuery from '@/beethovenx/composables/queries/useAllPoolSwapsQuery';

type Props = {
  lge: GqlLge;
  pool: FullPool;
};

const props = defineProps<Props>();
const { appNetworkConfig } = useWeb3();

const {
  isBeforeStart,
  isAfterEnd,
  startDateTimeFormatted,
  endDateTimeFormatted,
  launchToken,
  collateralToken,
  startsAt,
  poolLaunchToken
} = useLge(props.lge, props.pool);

const { fNum } = useNumbers();
const router = useRouter();
const { darkMode } = useDarkMode();
const { upToLargeBreakpoint } = useBreakpoints();
const { tokens, priceFor } = useTokens();
const { isWalletReady } = useWeb3();

const { data: swaps, isLoading } = useAllPoolSwapsQuery(
  ref(props.lge.id),
  ref(getUnixTime(startsAt.value))
);

function loadMoreSwaps() {
  //swapsQuery.fetchNextPage.value();
}

const columns = ref<ColumnDefinition<SubgraphSwap>[]>([
  {
    name: 'Time',
    id: 'timestamp',
    accessor: 'timestamp',
    sortKey: 'timestamp',
    width: 250
  },
  {
    name: 'Type',
    id: 'type',
    accessor: 'type',
    sortKey: 'type',
    width: 150
  },
  {
    name: 'Input',
    id: 'input',
    accessor: 'input',
    sortKey: 'input',
    width: 150
  },
  {
    name: 'Output',
    id: 'output',
    accessor: 'output',
    sortKey: 'output',
    width: 150
  },
  {
    name: `${poolLaunchToken.value?.symbol} Price`,
    id: 'price',
    accessor: 'price',
    sortKey: 'price',
    width: 150
  },
  {
    name: 'Wallet',
    id: 'wallet',
    accessor: 'wallet',
    sortKey: 'wallet',
    width: 150
  }
]);

const data = computed(() => {
  return orderBy(swaps.value || [], 'timestamp', 'desc').map(swap => ({
    timestamp:
      format(swap.timestamp * 1000, 'MMM dd') +
      ' at ' +
      format(swap.timestamp * 1000, 'HH:mm'),
    type:
      swap.tokenOut === props.lge.tokenContractAddress.toLowerCase()
        ? 'Buy'
        : 'Sell',
    input: `${numeral(parseFloat(swap.tokenAmountIn)).format('0,0.[00]')} ${
      swap.tokenInSym
    }`,
    output: `${numeral(parseFloat(swap.tokenAmountOut)).format('0,0.[00]')} ${
      swap.tokenOutSym
    }`,
    price: `$${
      swap.tokenOut === props.lge.tokenContractAddress.toLowerCase()
        ? (
            (parseFloat(swap.tokenAmountIn) / parseFloat(swap.tokenAmountOut)) *
            priceFor(getAddress(swap.tokenIn))
          ).toFixed(4)
        : (
            (parseFloat(swap.tokenAmountOut) / parseFloat(swap.tokenAmountIn)) *
            priceFor(getAddress(swap.tokenOut))
          ).toFixed(4)
    }`,
    wallet: `${swap.userAddress.id.substr(0, 6)}...${swap.userAddress.id.substr(
      -4
    )}`
  }));
});
</script>

<template>
  <BalCard
    shadow="lg"
    class="mt-4"
    :square="upToLargeBreakpoint"
    :noBorder="upToLargeBreakpoint"
    noPad
  >
    <BalTable
      :columns="columns"
      :data="data"
      :is-loading="isLoading"
      skeleton-class="h-64"
      sticky="both"
      :square="upToLargeBreakpoint"
      @load-more="loadMoreSwaps"
      :isSortable="false"
      :is-paginated="hasNextPage"
      :isLoadingMore="isLoadingMore"
    />
  </BalCard>
</template>
