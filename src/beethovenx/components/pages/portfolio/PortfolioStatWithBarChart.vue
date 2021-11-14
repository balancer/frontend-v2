<template>
  <BalLoadingBlock v-if="isLoading" class="h-44" />
  <div v-else>
    <BalCard>
      <div class="flex">
        <div class="flex flex-col w-48">
          <div class="text-gray-500 font-medium mb-2">
            {{ title }}
            <BalTooltip>
              <template v-slot:activator>
                <BalIcon
                  name="info"
                  size="sm"
                  class="ml-1 text-gray-400 -mb-px"
                />
              </template>
              <div v-html="infoText" class="w-52" />
            </BalTooltip>
          </div>

          <div class="flex-1">
            <h4>{{ stat }}</h4>
          </div>
          <div class="text-gray-500 font-medium">
            {{ subTitle }}
          </div>
        </div>
        <div class="flex-1">
          <template v-if="dates.length > 2">
            <ECharts
              ref="chartInstance"
              :class="['w-full', 'h-36']"
              :option="chartConfig"
              autoresize
              :update-options="{ replaceMerge: 'series' }"
            />
          </template>
          <BalBlankSlate v-else class="h-36">
            <BalIcon name="bar-chart" />
            <span class="dark:text-white">
              {{ $t('insufficientData') }}
            </span>
          </BalBlankSlate>
        </div>
      </div>
    </BalCard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref } from 'vue';
import numeral from 'numeral';
import * as echarts from 'echarts/core';
import ECharts from 'vue-echarts';
import useNumbers from '@/composables/useNumbers';
import useTailwind from '@/composables/useTailwind';
import { format } from 'date-fns';

export default defineComponent({
  //emits: ['periodSelected'],
  props: {
    title: {
      type: String,
      required: true
    },
    stat: {
      type: String,
      required: true
    },
    subTitle: {
      type: String,
      required: true
    },
    data: {
      type: Array as PropType<number[]>,
      required: true
    },
    dates: {
      type: Array as PropType<number[]>,
      required: true
    },
    barColor: {
      type: String,
      required: true
    },
    infoText: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true
    }
  },
  components: {
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const { fNum } = useNumbers();
    const tailwind = useTailwind();

    // https://echarts.apache.org/en/option.html
    const chartConfig = computed(() => ({
      xAxis: {
        type: 'category',
        axisLine: {
          show: false,
          onZero: false,
          lineStyle: { color: tailwind.theme.colors.gray['600'] }
        },
        axisLabel: {
          color: tailwind.theme.colors.gray[300],
          fontSize: 14,
          formatter: value => format(value * 1000, 'MMM. dd')
        },
        axisTick: {
          show: false
        },
        data: props.dates
      },
      yAxis: {
        type: 'value',
        show: false
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: tailwind.theme.colors.gray['800'],
        borderColor: tailwind.theme.colors.gray['800'],
        formatter: params => {
          return `
            <div class='flex flex-col font-body bg-white dark:bg-gray-800 dark:text-white'>
              ${params
                .map(
                  param => `
                <span>
                ${param.marker} ${
                    param.seriesName
                  } <span class='font-medium ml-2'>${fNum(param.value, 'usd')}
                  </span>
                </span>
              `
                )
                .join('')}
            </div>
          `;
        }
      },
      series: [
        {
          name: props.title,
          type: 'bar',
          data: props.data,
          itemStyle: {
            borderRadius: 10
          }
        }
      ],
      width: '100%',
      grid: {
        left: 0,
        right: '2.5%',
        top: '10%',
        bottom: '5%',
        containLabel: true
      },
      color: [props.barColor]
    }));

    return {
      //refs
      chartInstance,

      numeral,

      // computed
      chartConfig
    };
  }
});
</script>

<style>
.portfolio-value-line-chart {
  height: 536px;
}
</style>
