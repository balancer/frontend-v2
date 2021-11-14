<template>
  <BalLoadingBlock v-if="isLoading" :style="{ height: '632px' }" />
  <div v-else>
    <BalCard>
      <h4 class="mt-1">
        Portfolio Value
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="$t('portfolioValueInfo')" class="w-52" />
        </BalTooltip>
      </h4>
      <div class="text-gray-500 mb-2">{{ dateLabel }}</div>
      <template v-if="data.length > 2">
        <ECharts
          ref="chartInstance"
          class="w-full portfolio-value-line-chart"
          :option="chartConfig"
          autoresize
          :update-options="{ replaceMerge: 'series' }"
        />
      </template>
      <BalBlankSlate v-else :style="{ height: '562px' }">
        <BalIcon name="bar-chart" />
        <span class="dark:text-white">
          {{ $t('insufficientData') }}
        </span>
      </BalBlankSlate>
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
import { chartColors } from '@/constants/colors';
import { flatMap, groupBy, map } from 'lodash';
import {
  UserPortfolioData,
  UserTokenData
} from '@/services/beethovenx/beethovenx-types';
import { format } from 'date-fns';
import { orderBy } from 'lodash';

export default defineComponent({
  props: {
    assets: {
      type: Array as PropType<UserTokenData[]>,
      required: true
    },
    data: {
      type: Array as PropType<UserPortfolioData[]>,
      required: true
    },
    isLoading: {
      type: Boolean
    }
  },
  components: {
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const currentValue = ref('$0,00');
    const change = ref(0);
    const { fNum } = useNumbers();
    const tailwind = useTailwind();

    const dateLabel = computed(() => {
      if (props.data.length === 0) {
        return '';
      }

      const sorted = orderBy(props.data, 'timestamp', 'asc');
      const startDate = format(sorted[0].timestamp * 1000, 'MMM. d');
      const endDate = format(
        sorted[sorted.length - 1].timestamp * 1000,
        'MMM. d'
      );

      return `${startDate} - ${endDate}`;
    });

    const chartConfig = computed(() => {
      const grouped = groupBy(
        flatMap(props.data, item =>
          item.tokens
            .filter(token => token.percentOfPortfolio > 0.05)
            .map(token => ({
              ...token,
              timestamp: item.timestamp
            }))
        ),
        'symbol'
      );

      const barData = map(grouped, (tokens, symbol) => {
        return {
          name: symbol,
          type: 'bar',
          data: tokens.map(token => [
            token.timestamp * 1000,
            Math.round(token.totalValue * 100) / 100
          ]),
          itemStyle: { borderRadius: 6 }
        };
      });

      const sortedBarData = props.assets
        .map(asset => barData.find(data => data.name === asset.symbol))
        .filter(item => item !== undefined);

      return {
        xAxis: {
          type: 'time',
          axisLine: {
            onZero: false,
            lineStyle: { color: tailwind.theme.colors.gray['600'] }
          },
          axisLabel: {
            color: tailwind.theme.colors.gray[300],
            fontSize: 14,
            formatter: value => format(value, 'MMM. d')
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            onZero: false,
            lineStyle: { color: tailwind.theme.colors.gray['600'] }
          },
          axisLabel: {
            color: tailwind.theme.colors.gray[300],
            fontSize: 14,
            formatter: value =>
              `$${numeral(value).format(value > 1000 ? '0a' : '0.[00]')}`
          },
          splitLine: {
            lineStyle: {
              color: tailwind.theme.colors.gray['700']
            }
          }
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
                <div class="flex items-center">
                ${param.marker} <div class="flex-1">${
                    param.seriesName
                  }</div> <div class='font-medium ml-4'>${fNum(
                    param.value[1],
                    'usd'
                  )}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          `;
          }
        },
        series: [
          ...sortedBarData,
          {
            name: 'Portfolio Value',
            data: props.data.map(item => [
              item.timestamp * 1000,
              Math.round(item.totalValue * 100) / 100
            ]),
            type: 'line',
            smooth: 0.3,
            lineStyle: {
              width: 3
            },
            markPoint: {
              symbol: 'roundRect',
              symbolSize: 50
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
        color: chartColors
      };
    });

    return {
      //refs
      chartInstance,

      numeral,

      // data
      currentValue,
      change,

      // computed
      chartConfig,
      dateLabel
    };
  }
});
</script>

<style>
.portfolio-value-line-chart {
  height: 536px;
}
</style>
