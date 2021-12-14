<script lang="ts" setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { zip } from 'lodash';
import {
  addSeconds,
  format,
  formatISO,
  fromUnixTime,
  isBefore,
  parseISO
} from 'date-fns';
import useTailwind from '@/composables/useTailwind';
import useLbpAuctionState from '@/beethovenx/lbp/composables/useLbpAuctionState';
import useTokenPricesQuery from '@/beethovenx/composables/queries/useTokenPricesQuery';

const store = useStore();
const appLoading = computed(() => store.state.app.loading);
const tailwind = useTailwind();

const { data, launchToken, collateralToken, startsAt } = useLbpAuctionState();

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
  //tailwind.theme.colors.gray['500'],
  tailwind.theme.colors.green['400']
];

const tokenPriceValues = computed(() => {
  /*if (!beets.value || !usdc.value) {
    return [];
  }
  const fistTime = isBefore(new Date(), parseISO(props.lbpStartTime))
    ? parseISO(props.lbpStartTime)
    : new Date();
  const tokenPrices = (props.tokenPrices || []).filter(
    tokenPrice => tokenPrice.amount > '0.0001'
  );
  const times = [
    ...tokenPrices.map(price =>
      format(fromUnixTime(price.timestamp), 'yyyy-MM-dd HH:mm:ss')
    ),
    format(parseISO(lastPriceTimestamp.value), 'yyyy-MM-dd HH:mm:ss'),
    format(fistTime, 'yyyy-MM-dd HH:mm:ss')
  ];
  const prices = [
    ...tokenPrices.map(price => parseFloat(price.price)),
    currentTokenPrice.value,
    currentTokenPrice.value
  ];

  return zip(times, prices);*/

  return [];
});

const predictedPriceValues = computed(() => {
  /*if (!beets.value || !usdc.value) {
    return [];
  }

  const fistTime = isBefore(new Date(), parseISO(props.lbpStartTime))
    ? parseISO(props.lbpStartTime)
    : new Date();
  const beetsBalance = parseFloat(beets.value.balance);
  const usdcBalance = parseFloat(usdc.value.balance);
  let beetsWeight = parseFloat(beets.value.weight);
  let usdcWeight = parseFloat(usdc.value.weight);
  const predicted: number[] = [currentTokenPrice.value];
  const times: string[] = [format(fistTime, 'yyyy-MM-dd HH:mm:ss')];
  const endTimestamp = parseISO(props.lbpEndTime);
  let timestamp = fistTime;

  while (isBefore(addSeconds(timestamp, props.timeStep), endTimestamp)) {
    timestamp = addSeconds(timestamp, props.timeStep);
    beetsWeight -= props.weightStep;
    usdcWeight += props.weightStep;

    const beetsPrice =
      ((beetsWeight / usdcWeight) * usdcBalance) / beetsBalance;

    predicted.push(beetsPrice);
    times.push(format(timestamp, 'yyyy-MM-dd HH:mm:ss'));
  }

  times.push(format(endTimestamp, 'yyyy-MM-dd HH:mm:ss'));
  predicted.push(((80 / 20) * usdcBalance) / beetsBalance);

  return zip(times, predicted);*/

  return [];
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
  <BalLoadingBlock v-if="loading || appLoading" class="h-96" />
  <div class="chart mr-n2 ml-n2" v-else>
    <BalLbpLineChart
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
