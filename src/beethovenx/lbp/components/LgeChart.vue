<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { zip } from 'lodash';
import {
  addSeconds,
  format,
  formatISO,
  fromUnixTime,
  getUnixTime,
  isBefore,
  parseISO,
  subDays
} from 'date-fns';
import useTailwind from '@/composables/useTailwind';
import useLge from '@/beethovenx/lbp/composables/useLge';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { FullPool, OnchainTokenData } from '@/services/balancer/subgraph/types';
import LbpLineChart from '@/beethovenx/lbp/components/LbpLineChart.vue';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import useTokens from '@/composables/useTokens';
import {
  getLbpChartPredictedPriceData,
  getLbpChartTokenPriceData
} from '@/beethovenx/lbp/utils/lbpChartUtils';
import useAllPoolSwapsQuery from '@/beethovenx/composables/queries/useAllPoolSwapsQuery';
import { getAddress } from '@ethersproject/address';

const store = useStore();
const appLoading = computed(() => store.state.app.loading);
const tailwind = useTailwind();

type Props = {
  lge: GqlLge;
  pool: FullPool;
};

const props = defineProps<Props>();

const {
  launchToken,
  collateralToken,
  startsAt,
  loadingTokenPrices,
  tokenPrices,
  tokenPricesQuery,
  isBeforeStart,
  isAfterEnd,
  endsAt,
  launchTokenPrice,
  launchTokenStartingPrice
} = useLge(props.lge, props.pool);

const lastPriceTimestamp = computed(() => {
  const prices = tokenPrices.value;

  return prices && prices.length > 0
    ? fromUnixTime(prices[prices.length - 1].timestamp)
    : startsAt.value;
});

const chartColors = [
  tailwind.theme.colors.green['400'],
  tailwind.theme.colors.gray['500']
];

const { priceFor } = useTokens();
const { data: swaps, isLoading } = useAllPoolSwapsQuery(
  ref(props.lge.id),
  ref(getUnixTime(startsAt.value))
);

const tokenPriceValues = computed(() => {
  if (isBeforeStart.value) {
    return [];
  }

  return getLbpChartTokenPriceData({
    swaps: swaps.value || [],
    lge: props.lge,
    numSteps: 48,
    startsAt: startsAt.value,
    endsAt: endsAt.value,
    collateralTokenPrice: priceFor(props.lge.collateralTokenAddress)
  });
});

const predictedPriceValues = computed(() => {
  const poolLaunchToken =
    props.pool.onchain.tokens[getAddress(props.lge.tokenContractAddress)] ||
    null;
  const poolCollateralToken =
    props.pool.onchain.tokens[getAddress(props.lge.collateralTokenAddress)] ||
    null;

  if (!poolCollateralToken || !poolLaunchToken || isAfterEnd.value) {
    return [];
  }

  const { tokenEndWeight, collateralEndWeight } = props.lge;
  const firstTime = isBeforeStart.value ? startsAt.value : new Date();

  return getLbpChartPredictedPriceData({
    firstTime,
    endTime: endsAt.value,
    tokenCurrentWeight: parseFloat(poolLaunchToken.weight) * 100,
    tokenEndWeight,
    collateralCurrentWeight: parseFloat(poolCollateralToken.weight) * 100,
    collateralEndWeight,
    collateralBalance: parseFloat(poolCollateralToken.balance),
    tokenBalance: parseFloat(poolLaunchToken.balance),
    collateralTokenPrice: priceFor(props.lge.collateralTokenAddress),
    numSteps: 48
  });
});

const series = computed(() => {
  return [
    {
      name: `${launchToken.value?.symbol} Price`,
      values: tokenPriceValues.value
    },
    {
      name: 'Predicted Price*',
      values: predictedPriceValues.value
    }
  ];
});
</script>

<template>
  <BalLoadingBlock v-if="loadingTokenPrices || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2" v-else>
    <LbpLineChart
      :data="series"
      :isPeriodSelectionEnabled="false"
      :axisLabelFormatter="{ yAxis: '$0.000', xAxis: 'datetime' }"
      :color="chartColors"
      :legendState="{}"
      height="96"
      :showLegend="true"
      :disable-animation="true"
    />
  </div>
</template>
