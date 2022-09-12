<script setup lang="ts">
import * as echarts from 'echarts/core';
import { GridOption } from 'echarts/types/dist/shared';
import { last } from 'lodash';
import { Dictionary } from 'lodash';
import numeral from 'numeral';
import { computed, onMounted, ref, watch } from 'vue';
import ECharts from 'vue-echarts';

import useDarkMode from '@/composables/useDarkMode';
import useNumbers, { FNumOptions } from '@/composables/useNumbers';
import useTailwind from '@/composables/useTailwind';

type AxisMoveEvent = {
  seriesIndex: number;
  dataIndex: number;
};

type ChartData = {
  name: string;
  values: (readonly [string, number])[];
};

type AxisLabelFormat = {
  xAxis?: FNumOptions;
  yAxis?: FNumOptions;
};

type AreaStyle = {
  color: echarts.LinearGradientObject;
};

type Props = {
  data: ChartData[];
  chartType: string;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  onAxisMoved?: undefined | ((value: readonly [string, number]) => void);
  isLoading?: boolean;
  hideYAxis?: boolean;
  hideXAxis?: boolean;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  xAxisMinInterval?: number;
  showHeader?: boolean;
  needChartValue?: boolean;
  axisLabelFormatter?: AxisLabelFormat;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  color?: string[];
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  hoverColor?: string;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  hoverBorderColor?: string;
  height: number | string;
  showLegend?: boolean;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  legendState?: Dictionary<boolean>;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  forceResizeTick?: number; // manually uptick this variable to force a resize calculation on the chart
  isLastValueChipVisible?: boolean; // whether to show the little rectangle with the last value of the data
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  customGrid?: echarts.ComposeOption<GridOption>; // provide a custom grid for the chart
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  chartClass?: string; // sets the class for the chart container
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  wrapperClass?: unknown; // sets the class for the element which wraps the chart and the header
  showTooltip?: boolean; // shows the tooltip
  showTooltipLayer?: boolean; // hides tooltip floating layer
  useMinMax?: boolean; // whether to constrain the y-axis based on the min and max values of the data passed in
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  areaStyle?: AreaStyle;
};

const emit = defineEmits([
  'periodSelected',
  'setCurrentChartValue',
  'mouseLeaveEvent',
  'mouseEnterEvent',
]);

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  type: 'category',
  hideYAxis: false,
  hideXAxis: false,
  showHeader: false,
  needChartValue: false,
  showLegend: false,
  axisLabelFormatter: () => ({}),
  showTooltip: true,
  showTooltipLayer: true,
  useMinMax: false,
});

const chartInstance = ref<echarts.ECharts>();
const currentValue = ref('$0,00');
const change = ref(0);
const { fNum2 } = useNumbers();
const tailwind = useTailwind();
const { darkMode } = useDarkMode();

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
      return `${legendName}: ${fNum2(
        latestValue[1],
        props.axisLabelFormatter.yAxis
      )}`;
    },
    selected: props.legendState || {},
    textStyle: {
      color: darkMode.value
        ? tailwind.theme.colors.gray['100']
        : tailwind.theme.colors.gray['800'],
    },
    inactiveColor: darkMode.value
      ? tailwind.theme.colors.gray['700']
      : tailwind.theme.colors.gray['300'],
  },
  // controlling the display of the X-Axis
  xAxis: {
    type: 'time',
    show: !props.hideXAxis,
    axisTick: { show: false },
    axisLine: {
      show: false,
    },
    minInterval: props.xAxisMinInterval,
    axisLabel: {
      formatter: props.axisLabelFormatter.xAxis
        ? value => fNum2(value, props.axisLabelFormatter.xAxis)
        : undefined,
      color: tailwind.theme.colors.gray['400'],
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: ['rgba(250,250,250,0.3)', 'rgba(200,200,200,0.3)'],
      },
    },
  },
  // controlling the display of the Y-Axis
  yAxis: {
    axisLine: {
      show: false,
    },
    axisTick: { show: false },
    min: props.useMinMax ? 'dataMin' : null,
    max: props.useMinMax ? 'dataMax' : null,
    type: 'value',
    show: !props.hideYAxis,
    splitNumber: 4,
    splitLine: {
      show: false,
    },
    position: 'left',
    axisLabel: {
      show: !props.hideYAxis,
      formatter: props.axisLabelFormatter.yAxis
        ? value => fNum2(value, props.axisLabelFormatter.yAxis)
        : undefined,
      color: tailwind.theme.colors.gray['400'],
    },
    nameGap: 25,
  },
  color: props.color,
  // Controls the boundaries of the chart from the HTML defined rectangle
  grid: props.customGrid || {
    left: '2.5%',
    right: 0,
    top: '10%',
    bottom: '5%',
    containLabel: true,
  },
  tooltip: {
    show: props.showTooltip,
    showContent: props.showTooltipLayer,
    trigger: 'axis',
    confine: true,
    axisPointer: {
      type: 'shadow',
      label: {
        show: false,
      },
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
                      ${param.marker} ${param.seriesName}
                      <span class='font-semibold'>
                        ${fNum2(param.value[1], props.axisLabelFormatter.yAxis)}
                      </span>
                    </span>
                  `
                )
                .join('')}
            </div>
          `;
    },
  },
  series: props.data.map((d, i) => ({
    data: d.values,
    type: props.chartType,
    smooth: 0.3,
    showSymbol: false,
    name: d.name,
    silent: true,
    animationEasing: function (k) {
      return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    },
    lineStyle: {
      width: 2,
    },
    areaStyle: props.areaStyle,
    itemStyle: {
      borderRadius: 100,
    },
    emphasis: {
      itemStyle: {
        color: props.hoverColor,
        borderColor: props.hoverBorderColor,
      },
    },
    // This is a retrofitted option to show the small pill with the
    // latest value of the series at the end of the line on the RHS
    // the line is hidden, but the label is shown with extra styles
    markLine: {
      symbol: 'roundRect',
      symbolSize: 0,
      lineStyle: {
        color: 'rgba(0, 0, 0, 0)',
      },
      precision: 5,
      label: {
        backgroundColor: (props.color || [])[i] || 'black',
        borderRadius: 3,
        padding: 4,
        formatter: (params: any) => {
          return fNum2(params.data.yAxis, props.axisLabelFormatter.yAxis);
        },
        color: '#FFF',
        fontSize: 10,
      },
      data: props.isLastValueChipVisible
        ? [
            {
              name: 'Latest',
              yAxis:
                props.data[i]?.values.length > 0
                  ? (last(props.data[i]?.values) || [])[1]
                  : 0,
            },
          ]
        : [],
      animation: false,
    },
  })),
}));

const styleOverrides = computed(() => {
  let style: any = {};
  if (props.height && typeof props.height === 'number') {
    style.height = `${props.height}px`;
  }
  return style;
});

// sometimes the autoresize doesn't resize as often as we'd like
// for page size changes, its own mechanism is fine however for
// usages where we need to animate the size of the graph, it's not as
// smooth so we can use this little tick (updated by anim tick) to resize
// smoothly.
watch(
  () => props.forceResizeTick,
  () => {
    if (chartInstance.value) {
      chartInstance.value.resize();
    }
  }
);

function setCurrentValueToLatest(updateCurrentValue: boolean) {
  const currentDayValue = numeral(
    (props.data[0].values[props.data[0].values.length - 1] || [])[1]
  );

  if (updateCurrentValue) {
    currentValue.value = fNum2(
      currentDayValue.value() || 0,
      props.axisLabelFormatter.yAxis || {
        style: 'currency',
        currency: 'USD',
        fixedFormat: true,
      }
    );
    const currentChartValue = props.data[0].values[0];

    if (currentChartValue) {
      emit('setCurrentChartValue', {
        chartDate: currentChartValue[0],
        chartValue: currentChartValue[1],
      });
    }
  }

  const startValue = numeral((props.data[0].values[0] || [])[1]);
  change.value =
    ((currentDayValue.value() || 0) - (startValue.value() || 0)) /
    (startValue.value() || 0);
}

// make sure to update the latest values when we get a fresh set of data
watch(
  () => props.data,
  () => {
    setCurrentValueToLatest(true);
  }
);

// make sure to update the latest values when we get a fresh set of data
// need to do this onMount as well since the data doesn't change on mount
// it simply is there without change so it won't trigger the watcher
onMounted(() => {
  setCurrentValueToLatest(true);
});

//reset the current value to latest when the user's mouse leaves the view
function handleMouseLeave() {
  setCurrentValueToLatest(true);
  emit('mouseLeaveEvent');
}

function handleMouseEnter() {
  emit('mouseEnterEvent');
}

// Triggered when hovering mouse over different xAxis points
const handleAxisMoved = ({ dataIndex, seriesIndex }: AxisMoveEvent) => {
  if (!props.showHeader && !props.needChartValue) return;
  if (props.data[seriesIndex]?.values) {
    props.onAxisMoved &&
      props.onAxisMoved(props.data[seriesIndex].values[dataIndex]);

    const currentChartValue = props.data[seriesIndex].values[dataIndex];

    emit('setCurrentChartValue', {
      chartDate: currentChartValue[0],
      chartValue: currentChartValue[1],
    });

    currentValue.value = fNum2(
      props.data[seriesIndex].values[dataIndex][1],
      props.axisLabelFormatter.yAxis || {
        style: 'currency',
        currency: 'USD',
        fixedFormat: true,
      }
    );

    // if first point in chart, show overall change
    if (dataIndex === 0) {
      const prev = Number(props.data[seriesIndex].values[0][1]);
      const current = props.data[seriesIndex].values[
        props.data[seriesIndex].values.length - 1
      ][1] as number;
      change.value = (current - prev) / prev;
    } else {
      const prev = props.data[seriesIndex].values[dataIndex - 1][1] as number;
      const current = props.data[seriesIndex].values[dataIndex][1] as number;
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
  }
};
</script>

<template>
  <BalLoadingBlock v-if="isLoading" class="mt-16 h-96" />
  <div
    v-else
    :class="wrapperClass"
    @mouseenter="handleMouseEnter"
    @touchstart.passive="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @touchend="handleMouseLeave"
  >
    <div v-if="showHeader" id="lineChartHeader" class="mb-4">
      <h3 class="text-xl tracking-wider text-gray-800 dark:text-gray-400">
        {{ currentValue }}
      </h3>
      <span
        :class="{
          'text-green-400': change >= 0,
          'text-red-400': change < 0,
          'font-medium': true,
        }"
        >{{ numeral(change).format('+0.0%') }}
      </span>
    </div>
    <ECharts
      ref="chartInstance"
      :class="[
        height && typeof (height === 'string') ? `h-${height}` : '',
        'w-full',
        chartClass,
      ]"
      :option="chartConfig"
      autoresize
      :updateOptions="{ replaceMerge: 'series' }"
      :style="[styleOverrides]"
      @update-axis-pointer="handleAxisMoved"
    />
  </div>
</template>
