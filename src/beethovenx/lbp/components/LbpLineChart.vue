<template>
  <BalLoadingBlock v-if="isLoading" class="h-96 mt-16" />
  <div v-else>
    <div id="lineChartHeader" class="mb-4" v-if="showHeader">
      <h3 class="text-gray-800 text-xl tracking-wider">
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
//import 'echarts';
import { computed, defineComponent, PropType, ref } from 'vue';
import numeral from 'numeral';
import * as echarts from 'echarts/core';
import ECharts from 'vue-echarts';
import { last } from 'lodash';
import useNumbers, { Preset } from '@/composables/useNumbers';
import { format } from 'date-fns';
import useTailwind from '@/composables/useTailwind';
import useDarkMode from '@/composables/useDarkMode';

type AxisMoveEvent = {
  seriesIndex: number;
  dataIndex: number;
};

type ChartData = {
  name: string;
  values: number[];
};

interface AxisLabelFormat {
  xAxis?: 'datetime' | Preset | string;
  yAxis?: Preset | string;
}

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
    hideYAxis: { type: Boolean, default: false },
    hideXAxis: { type: Boolean, default: false },
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
    },
    legendState: {
      type: Object
    },
    disableAnimation: {
      type: Boolean
    },
    xAxisFormat: {
      type: String,
      default: 'd MMM'
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
    const tailwind = useTailwind();
    const { darkMode } = useDarkMode();

    const axisColor = computed(() =>
      darkMode.value
        ? tailwind.theme.colors.gray['600']
        : tailwind.theme.colors.gray['100']
    );

    // https://echarts.apache.org/en/option.html
    const chartConfig = computed(() => ({
      ...(props.disableAnimation ? { animation: false } : {}),
      // controls the legend you see at the top
      // formatter allows us to show the latest value for each series
      legend: {
        show: props.showLegend,
        left: -4,
        top: -4,
        icon: 'roundRect',
        itemHeight: 10,
        formatter: (legendName: string) => `${legendName}`,
        selected: props.legendState,
        textStyle: {
          color: darkMode.value
            ? tailwind.theme.colors.gray['100']
            : tailwind.theme.colors.gray['800'],
          fontSize: 14
        },
        inactiveColor: darkMode.value
          ? tailwind.theme.colors.gray['700']
          : tailwind.theme.colors.gray['300']
      },
      // controlling the display of the X-Axis
      xAxis: {
        type: 'time',
        show: !props.hideXAxis,
        axisTick: { show: true, alignWithLabel: true },
        axisLine: {
          onZero: false,
          lineStyle: { color: axisColor.value }
        },
        axisLabel: {
          formatter: value => format(value, props.xAxisFormat),
          color: tailwind.theme.colors.gray[300],
          fontSize: 14
        }
      },
      // controlling the display of the Y-Axis
      yAxis: {
        axisLine: {
          show: false,
          lineStyle: { color: axisColor.value }
        },
        type: 'value',
        show: !props.hideYAxis,
        splitNumber: 4,
        splitLine: {
          show: false
        },
        position: 'left',
        axisLabel: {
          show: true,
          formatter: props.axisLabelFormatter.yAxis
            ? value =>
                fNum(value, null, { format: props.axisLabelFormatter.yAxis })
            : undefined,
          color: tailwind.theme.colors.gray[300],
          fontSize: 14
        },
        nameGap: 25,
        min: value => value.min * 0.99,
        max: value => value.max * 1.01
      },
      color: props.color,
      // Controls the boundaries of the chart from the HTML defined rectangle
      grid: {
        left: 0,
        right: '2.5%',
        top: '10%',
        bottom: '5%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          label: {
            show: false
          }
        },
        backgroundColor: darkMode.value
          ? tailwind.theme.colors.gray['800']
          : tailwind.theme.colors.white,
        borderColor: darkMode.value
          ? tailwind.theme.colors.gray['900']
          : tailwind.theme.colors.white,
        formatter: params => {
          return `
            <div class='flex flex-col font-body bg-white dark:bg-gray-850 dark:text-white'>
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
        smooth: 0.3,
        showSymbol: false,
        symbolSize: 8,
        name: d.name,
        lineStyle: {
          width: 2
        },

        markPoint:
          i === 0
            ? {
                symbol: 'circle',
                symbolSize: 8,
                itemStyle: {
                  borderColor: (props.color || [])[i] || 'black',
                  borderWidth: 2.5,
                  color: 'white',
                  shadowColor: 'white',
                  shadowBlur: 8
                },
                label: {
                  show: false
                },
                data: [{ name: 'Latest', coord: last(props.data[i].values) }],
                animation: false
                //animationDuration: 10000
              }
            : undefined
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
