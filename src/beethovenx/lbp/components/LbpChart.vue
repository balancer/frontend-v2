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

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
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
import {
  DecoratedPool,
  SubgraphTokenPrice
} from '@/services/balancer/subgraph/types';

interface HistoryItem {
  timestamp: number;
  price: number[];
  amounts: string[];
  totalShares: string;
}

export default defineComponent({
  name: 'BeetsLBPChart',

  props: {
    lbpTokenName: { type: String, required: true },
    lbpTokenAddress: { type: String, required: true },
    lbpPoolId: { type: String, required: true },
    lbpEndTime: { type: String, required: true },
    lbpStartTime: { type: String, required: true },
    weightStep: { type: Number, required: true },
    timeStep: { type: Number, required: true },
    loading: { type: Boolean, default: true },
    usdcAddress: { type: String, required: true },
    tokenPrices: {
      type: Array as PropType<SubgraphTokenPrice[]>,
      required: true
    },
    pool: { type: Object as PropType<DecoratedPool>, required: true }
  },

  setup(props) {
    const store = useStore();
    const appLoading = computed(() => store.state.app.loading);
    const tailwind = useTailwind();
    const beets = computed(() =>
      props.pool?.tokens?.find(
        token => token.address.toLowerCase() === props.lbpTokenAddress
      )
    );
    const usdc = computed(() =>
      props.pool?.tokens?.find(
        token => token.address.toLowerCase() === props.usdcAddress
      )
    );
    const currentBeetsPrice = computed(() => {
      if (!beets.value || !usdc.value) {
        return 0;
      }

      const beetsBalance = parseFloat(beets.value?.balance || '0');
      const beetsWeight = parseFloat(beets.value?.weight || '0');
      const usdcBalance = parseFloat(usdc.value?.balance || '0');
      const usdcWeight = parseFloat(usdc.value?.weight || '0');

      return ((beetsWeight / usdcWeight) * usdcBalance) / beetsBalance;
    });

    const lastPriceTimestamp = computed(() => {
      const prices = props.tokenPrices;

      return prices && prices.length > 0
        ? formatISO(fromUnixTime(prices[prices.length - 1].timestamp))
        : props.lbpStartTime;
    });

    const chartColors = [
      //tailwind.theme.colors.gray['500'],
      tailwind.theme.colors.green['400']
    ];

    const beetsPriceValues = computed(() => {
      if (!beets.value || !usdc.value) {
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
        currentBeetsPrice.value,
        currentBeetsPrice.value
      ];

      return zip(times, prices);
    });

    const predictedPriceValues = computed(() => {
      if (!beets.value || !usdc.value) {
        return [];
      }

      const fistTime = isBefore(new Date(), parseISO(props.lbpStartTime))
        ? parseISO(props.lbpStartTime)
        : new Date();
      const beetsBalance = parseFloat(beets.value.balance);
      const usdcBalance = parseFloat(usdc.value.balance);
      let beetsWeight = parseFloat(beets.value.weight);
      let usdcWeight = parseFloat(usdc.value.weight);
      const predicted: number[] = [currentBeetsPrice.value];
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

      return zip(times, predicted);
    });

    const series = computed(() => {
      return [
        /*{
          name: 'Predicted Price*',
          values: predictedPriceValues.value
        },*/
        {
          name: 'BEETS Price',
          values: beetsPriceValues.value
        }
      ];
    });

    return {
      series,
      appLoading,
      chartColors,
      lastPriceTimestamp
    };
  }
});
</script>
