<template>
  <BalLoadingBlock v-if="isLoading" class="h-96 mt-16" />
  <div v-else>
    <div id="lineChartHeader" class="mb-4" v-if="showHeader">
      <h3 class="text-gray-800 font-semibold text-xl tracking-wider">
        {{ currentValue }}
      </h3>
      <span
        :class="{
          'text-green-400': change >= 0,
          'text-red-400': change < 0,
          'font-medium': true
        }"
        >{{ numeral(change).format('+0.0%') }}</span
      >
    </div>
    <ECharts
      ref="chartInstance"
      :class="[height ? `h-${height}` : '', 'w-full']"
      :option="chartConfig"
      autoresize
      @updateAxisPointer="handleAxisMoved"
      :update-options="{ replaceMerge: 'series' }"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, computed } from 'vue';
import numeral from 'numeral';
import * as echarts from 'echarts/core';
import ECharts from 'vue-echarts';
import { last } from 'lodash';
import useNumbers, { Preset } from '@/composables/useNumbers';

type AxisMoveEvent = {
  seriesIndex: number;
  dataIndex: number;
};

type ChartData = {
  name: string;
  values: number[];
};

type AxisLabelFormat = {
  xAxis?: Preset | string;
  yAxis?: Preset | string;
};

type PeriodOption = {
  option: string;
  value: string;
};

export default defineComponent({
  emits: ['periodSelected'],
  props: {
    data: {
      type: Array as PropType<ChartData[]>,
      required: true
    },
    onAxisMoved: {
      type: Function
    },
    isLoading: {
      type: Boolean,
      default: () => false
    },
    currentGraphingPeriod: {
      type: Number
    },
    periodOptions: {
      type: Array as PropType<PeriodOption[]>
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
      // controls the legend you see at the top
      // formatter allows us to show the latest value for each series
      legend: {
        show: props.showLegend,
        left: 0,
        top: 0,
        icon: 'roundRect',
        itemHeight: 5,
        formatter: (legendName: string) => {
          const latestValue = last(
            props.data.find(d => d.name === legendName)?.values as any
          ) as [string | number, string | number];
          return `${legendName}: ${fNum(latestValue[1], null, {
            format: props.axisLabelFormatter.yAxis
          })}`;
        }
      },
      // controlling the display of the X-Axis
      xAxis: {
        type: 'time',
        show: props.showAxis,
        axisTick: { show: true, alignWithLabel: true },
        axisLine: { onZero: false, lineStyle: { color: '#D8D8D8' } },
        axisLabel: {
          formatter: props.axisLabelFormatter.xAxis
            ? value =>
                fNum(value, null, { format: props.axisLabelFormatter.xAxis })
            : undefined,
          color: '#718B98'
        }
      },
      // controlling the display of the Y-Axis
      yAxis: {
        axisLine: { show: true, lineStyle: { color: '#D8D8D8' } },
        type: 'value',
        show: props.showAxis,
        splitNumber: 4,
        splitLine: {
          show: false
        },
        position: 'right',
        axisLabel: {
          formatter: props.axisLabelFormatter.yAxis
            ? value =>
                fNum(value, null, { format: props.axisLabelFormatter.yAxis })
            : undefined,
          color: '#718B98'
        },
        nameGap: 25
      },
      color: props.color,
      // Controls the boundaries of the chart from the HTML defined rectangle
      grid: {
        left: '2.5%',
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
        formatter: params => {
          return `
            <div class='flex flex-col font-body'>
              <span>${params[0].value[0]}</span>
              ${params
                .map(
                  param => `
                <span>
                ${param.marker} ${
                    param.seriesName
                  } <span class='font-medium'>${fNum(param.value[1], null, {
                    format: props.axisLabelFormatter.yAxis
                  })}
                  </span>
                </span>
              `
                )
                .join('')}
            </div>
          `;
        }
      },
      series: props.data.map((d, i) => ({
        data: d.values,
        type: 'line',
        smooth: false,
        showSymbol: false,
        name: d.name,
        silent: true,
        animationEasing: function(k) {
          return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        },
        lineStyle: {
          width: 2
        },
        // This is a retrofitted option to show the small pill with the
        // latest value of the series at the end of the line on the RHS
        // the line is hidden, but the label is shown with extra styles
        markLine: {
          symbol: 'roundRect',
          symbolSize: 0,
          lineStyle: {
            color: 'rgba(0, 0, 0, 0)'
          },
          precision: 5,
          label: {
            backgroundColor: (props.color || [])[i] || 'black',
            borderRadius: 3,
            padding: 4,
            formatter: (params: any) => {
              return fNum(params.data.yAxis, null, {
                format: props.axisLabelFormatter.yAxis
              });
            },
            color: '#FFF',
            fontSize: 10
          },
          data: [
            {
              name: 'Latest',
              yAxis: (last(props.data[i].values) || [])[1]
            }
          ]
        }
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

      // data
      currentValue,
      change,

      // computed
      chartConfig
    };
  }
});
</script>
