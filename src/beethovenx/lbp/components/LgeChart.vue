<script lang="ts" setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { zip } from 'lodash';
import { format, fromUnixTime, parseISO } from 'date-fns';
import useTailwind from '@/composables/useTailwind';
import useLge from '@/beethovenx/lbp/composables/useLge';
import { GqlLge } from '@/beethovenx/services/beethovenx/beethovenx-types';
import { FullPool } from '@/services/balancer/subgraph/types';
import LbpLineChart from '@/beethovenx/lbp/components/LbpLineChart.vue';
import BalLoadingBlock from '@/components/_global/BalLoadingBlock/BalLoadingBlock.vue';
import useTokens from '@/composables/useTokens';
import { getLbpChartPredictedPriceData } from '@/beethovenx/lbp/utils/lbpChartUtils';

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
  poolCollateralToken,
  poolLaunchToken
} = useLge(props.lge, props.pool);

const currentTokenPrice = computed(() => {
  return 0;
});

const lastPriceTimestamp = computed(() => {
  /*const prices = props.tokenPrices;

  return prices && prices.length > 0
    ? formatISO(fromUnixTime(prices[prices.length - 1].timestamp))
    : props.lbpStartTime;*/

  return startsAt.value.toISOString();
});

const chartColors = [
  tailwind.theme.colors.gray['500'],
  tailwind.theme.colors.green['400']
];

const { priceFor } = useTokens();

const tokenPriceValues = computed(() => {
  if (!poolCollateralToken.value || !poolLaunchToken.value) {
    return [];
  }

  const firstTime = isBeforeStart.value ? startsAt.value : new Date();
  //const tokenPrices = props.tokenPrices || [];
  const tokenPrices: any[] = [];

  const times = [
    ...tokenPrices.map(price =>
      format(fromUnixTime(price.timestamp), 'yyyy-MM-dd HH:mm:ss')
    ),
    format(parseISO(lastPriceTimestamp.value), 'yyyy-MM-dd HH:mm:ss'),
    format(firstTime, 'yyyy-MM-dd HH:mm:ss')
  ];
  const prices = [
    ...tokenPrices.map(price => parseFloat(price.price)),
    currentTokenPrice.value,
    currentTokenPrice.value
  ];

  return zip(times, prices);
});

const predictedPriceValues = computed(() => {
  if (!poolCollateralToken.value || !poolLaunchToken.value) {
    return [];
  }

  const { tokenEndWeight, collateralEndWeight } = props.lge;
  const firstTime = isBeforeStart.value ? startsAt.value : new Date();
  const collateralBalance = parseFloat(poolCollateralToken.value.balance);

  return getLbpChartPredictedPriceData({
    firstTime,
    endTime: endsAt.value,
    tokenCurrentWeight: parseFloat(poolLaunchToken.value.weight),
    tokenEndWeight,
    collateralCurrentWeight: parseFloat(poolCollateralToken.value.weight),
    collateralEndWeight,
    collateralBalance,
    tokenBalance: parseFloat(poolLaunchToken.value.balance),
    collateralTokenPrice: priceFor(props.lge.collateralTokenAddress),
    numSteps: 48
  });
});

const series = computed(() => {
  return [
    {
      name: 'Predicted Price*',
      values: predictedPriceValues.value
    },
    {
      name: `${launchToken.value?.symbol} Price`,
      values: tokenPriceValues.value
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
    />
  </div>
</template>
