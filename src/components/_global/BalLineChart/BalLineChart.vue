<template>
  <BalLoadingBlock v-if="isLoading" class="h-96 mt-16" />
  <div v-else>
    <div id="lineChartHeader" class="mb-4" v-if="showHeader">
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
      class="w-full"
      :class="[height ? `h-${height}` : '']"
      :option="chartConfig"
      autoresize
      @updateAxisPointer="handleAxisMoved"
      :update-options="{ replaceMerge: 'series' }"
    />
    <div v-if="isPeriodSelectionEnabled" class="flex w-full mt-2 justify-end">
      <bal-button-group
        :options="periodOptions"
        :value="currentGraphingPeriod"
        :onChange="onPeriodSelected"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed, watch } from 'vue';
import numeral from 'numeral';
import * as echarts from 'echarts/core';
import ECharts from 'vue-echarts';
import { format as formatDate } from 'date-fns';
import pools from '@/store/modules/pools';
import { last } from 'lodash';
import useNumbers, { Preset } from '@/composables/useNumbers';

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

type ChartData = {
  name: string;
  values: string[] | number[];
};

type AxisLabelFormat = {
  xAxis?: Preset;
  yAxis?: Preset;
};

export default defineComponent({
  props: {
    data: {
      type: Array as PropType<Array<ChartData>>,
      required: true,
      default: () => []
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
    },
    isPeriodSelectionEnabled: {
      type: Boolean,
      default: () => true
    },
    type: {
      type: String as PropType<'category' | 'time'>,
      default: () => 'category'
    },
    showAxis: {
      type: Boolean
    },
    showHeader: {
      type: Boolean
    },
    showGradient: {
      type: Boolean
    },
    axisLabelFormatter: {
      type: Object as PropType<AxisLabelFormat>,
      default: () => ({})
    },
    color: {
      type: Array as PropType<string[]>
    },
    height: {
      type: String
    },
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    showLegend: {
      type: Boolean
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

    const { fNum } = useNumbers();

    // https://echarts.apache.org/en/option.html
    const chartConfig = computed(() => ({
      legend: {
        show: props.showLegend,
        left: 0,
        top: 0,
        icon: 'roundRect',
        itemHeight: 5,
        formatter: (legendName: string) => {
          const latestValue = last(
            props.data.find(d => (d.name = legendName))?.values as any
          ) as [unknown, unknown];
          return `${legendName}: ${latestValue[1]}`;
        }
      },
      xAxis: {
        type: 'time',
        show: props.showAxis,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          formatter: props.axisLabelFormatter.xAxis
            ? value => fNum(value, props.axisLabelFormatter.xAxis)
            : undefined,
          interval: () => true
        }
      },
      yAxis: {
        axisLine: { show: false },
        type: 'value',
        show: props.showAxis,
        splitNumber: 4,
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        position: 'right',
        axisLabel: {
          formatter: value => fNum(value, props.axisLabelFormatter.yAxis)
        },
        min: props.min,
        max: props.max
      },
      color: props.color,
      grid: {
        left: 0,
        right: 0,
        top: '10%',
        bottom: '5%',
        containLabel: props.showAxis
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          label: {
            show: false
          }
        },
        triggerOn: 'mousemove',
        hideDelay: 0,
        formatter: params =>
          `<span class="font-semibold">${formatDate(
            new Date(params[0].axisValue),
            'do LLL yyyy'
          )}</span>`,
        shadowColor: 'none',
        backgroundColor: 'transparent'
      },
      series: props.data.map(d => ({
        data: d.values,
        type: 'line',
        smooth: false,
        symbol: 'none',
        name: d.name,
        lineStyle: {
          width: 2
        },
        areaStyle: props.showGradient
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0.1,
                  color: '#f5fff5'
                },
                {
                  offset: 0.8,
                  color: '#FFF'
                }
              ])
            }
          : null
      }))
    }));

    // Triggered when hovering mouse over different xAxis points
    const handleAxisMoved = ({ dataIndex, seriesIndex }: AxisMoveEvent) => {
      if (!props.showHeader) return;
      props.onAxisMoved &&
        props.onAxisMoved(props.data[seriesIndex].values[dataIndex]);
      currentValue.value = numeral(props.data[dataIndex]).format('$0,0.00');

      // no change if first point in the chart
      if (dataIndex === 0) {
        change.value = 0;
      } else {
        const prev = props.data[seriesIndex].values[dataIndex - 1] as number;
        const current = props.data[seriesIndex].values[dataIndex] as number;
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
      handleAxisMoved,
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
