<template>
  <BalLoadingBlock v-if="isLoading" class="h-96 mt-16" />
  <div v-else>
    <div id="lineChartHeader">
      <h3 class="text-gray-800 font-semibold text-xl tracking-wider">
        {{ currentValue }}
      </h3>
      <span
        class="font-medium"
        :class="{ 'text-green-400': change >= 0, 'text-red-400': change < 0 }"
        >{{ numeral(change).format('+0.0%') }}</span
      >
    </div>
    <ECharts
      ref="chartInstance"
      class="w-full h-72"
      :option="chartConfig"
      autoresize
      @updateAxisPointer="_onAxisMoved"
      :update-options="{ replaceMerge: 'series' }"
    />
    <div class="flex w-full mt-2 justify-end">
      <bal-button-group
        :options="periodOptions"
        :value="currentGraphingPeriod"
        :onChange="onPeriodSelected"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import numeral from 'numeral';
import * as echarts from 'echarts/core';
import ECharts from 'vue-echarts';
import { format as formatDate } from 'date-fns';

const PeriodOptions = [
  {
    label: '1d',
    value: 1
  },
  {
    label: '1w',
    value: 7
  },
  {
    label: '1m',
    value: 30
  },
  {
    label: '3m',
    value: 90
  },
  {
    label: '1y',
    value: 365
  }
];

type AxisMoveEvent = {
  seriesIndex: number;
  dataIndex: number;
};

export default defineComponent({
  props: {
    axis: {
      type: Array as PropType<string[] | number[]>,
      required: true,
      default: () => []
    },
    data: {
      type: Array as PropType<string[] | number[]>,
      required: true,
      default: () => []
    },
    name: {
      type: String,
      required: true,
      default: () => 'Please provide a chart name'
    },
    onAxisMoved: {
      type: Function
    },
    onPeriodSelected: {
      type: Function
    },
    isLoading: {
      type: Boolean,
      default: () => false
    },
    currentGraphingPeriod: {
      type: Number
    }
  },
  components: {
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const lineChart = ref<HTMLElement>();
    const currentValue = ref('$0,00');
    const change = ref(0);

    // https://echarts.apache.org/en/option.html
    const chartConfig = computed(() => ({
      xAxis: {
        type: 'category',
        data: props.axis,
        show: false,
        min: 0
      },
      yAxis: {
        type: 'value',
        show: false
      },
      color: ['#07C808'],
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: '5%',
        containLabel: false
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          label: {
            show: false
          }
        },
        formatter: params =>
          `<span class="font-semibold">${formatDate(
            new Date(params[0].axisValue),
            'do LLL yyyy'
          )}</span>`,
        shadowColor: 'none',
        backgroundColor: 'transparent'
      },
      series: [
        {
          data: props.data,
          type: 'line',
          smooth: false,
          symbol: 'none',
          name: props.name,
          lineStyle: {
            width: 2
          }
        }
      ]
    }));

    // Triggered when hovering mouse over different xAxis points
    const _onAxisMoved = ({ dataIndex }: AxisMoveEvent) => {
      props.onAxisMoved && props.onAxisMoved(props.data[dataIndex]);
      currentValue.value = numeral(props.data[dataIndex]).format('$0,0.00');

      // no change if first point in the chart
      if (dataIndex === 0) {
        change.value = 0;
      } else {
        const prev = props.data[dataIndex - 1] as number;
        const current = props.data[dataIndex] as number;
        const _change = (current - prev) / prev;

        // 100% increase if coming from a 0!
        if (prev === 0 && current !== 0) {
          change.value = 1;
          return;
        }

        // any errors or 0 division, fall back to 0
        if (isNaN(_change)) {
          change.value = 0;
          return;
        }
        change.value = _change;
      }
    };

    return {
      //refs
      chartInstance,
      lineChart,

      // methods
      _onAxisMoved,
      numeral,
      periodOptions: PeriodOptions,

      // data
      currentValue,
      change,

      // computed
      chartConfig
    };
  }
});
</script>
