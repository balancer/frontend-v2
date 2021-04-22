<template>
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
    :option="option"
    autoresize
    @updateAxisPointer="_onAxisMoved"
  />
  <div class="flex w-full mt-2 justify-end">
    <bal-button-group
      :options="periodOptions"
      :defaultValue="30"
      :onChange="onPeriodSelected"
    />
  </div>
</template>

<script lang="ts">
import { onMounted, defineComponent, PropType, ref } from 'vue';
import numeral from 'numeral';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts/types/dist/shared';
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

// https://echarts.apache.org/en/option.html
const LineChartConfig = (
  name: string,
  xAxis: string[] | number[],
  data: string[] | number[]
): EChartsOption => ({
  xAxis: {
    type: 'category',
    data: xAxis,
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
      data,
      type: 'line',
      smooth: false,
      symbol: 'none',
      name,
      lineStyle: {
        width: 2
      }
    }
  ]
});

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
    }
  },
  components: {
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const lineChart = ref<HTMLElement>();
    const option = ref<EChartsOption>({});
    const currentValue = ref('$0,00');
    const change = ref(0);

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

        // any errors or 0 division, fall back to 0
        if (isNaN(_change)) {
          change.value = 0;
          return;
        }
        change.value = _change;
      }
    };

    onMounted(() => {
      // This is a small trick to trigger an animation on first mount
      // rather than have the chart just pop into existence
      setTimeout(() => {
        option.value = LineChartConfig(props.name, props.axis, props.data);
      }, 0);
    });

    return {
      chartInstance,
      lineChart,
      option,
      _onAxisMoved,
      currentValue,
      change,
      numeral,
      periodOptions: PeriodOptions
    };
  }
});
</script>
