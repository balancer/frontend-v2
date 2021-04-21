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
    class="w-full h-96"
    :option="option"
    autoresize
    @updateAxisPointer="_onAxisMoved"
  />
</template>

<script lang="ts">
import { onMounted, defineComponent, PropType, ref } from 'vue';
import numeral from 'numeral';
import * as echarts from 'echarts/core';
import { EChartsOption } from 'echarts/types/dist/shared';
import ECharts from 'vue-echarts';
import { format as formatDate } from 'date-fns';

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
    shadowBlur: 0,
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
    }
  },
  components: {
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const lineChart = ref<HTMLElement>();
    const option = ref<EChartsOption>({});
    const currentValue = ref('$0.00');
    const change = ref(0);

    const _onAxisMoved = ({ dataIndex }: AxisMoveEvent) => {
      props.onAxisMoved && props.onAxisMoved(props.data[dataIndex]);
      currentValue.value = numeral(props.data[dataIndex]).format('$0.00');

      if (dataIndex === 0) {
        change.value = 0;
      } else {
        const prev = props.data[dataIndex - 1] as number;
        const current = props.data[dataIndex] as number;
        const _change = (current - prev) / prev;
        if (isNaN(_change)) {
          change.value = 0;
          return;
        }
        change.value = _change;
      }
    };

    onMounted(() => {
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
      numeral
    };
  }
});
</script>
