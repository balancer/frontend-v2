<template>
  <BalLoadingBlock v-if="isLoading" :style="{ height: '632px' }" />
  <div v-else>
    <BalCard :style="{ minHeight: '632px' }">
      <h4 class="mb-4 mt-1">
        Assets
        <BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="$t('portfolioAssetsPieChartInfo')" class="w-52" />
        </BalTooltip>
      </h4>
      <ECharts
        ref="chartInstance"
        class="h-64 w-full"
        :option="chartConfig"
        autoresize
        :update-options="{ replaceMerge: 'series' }"
      />
      <div class="mt-8">
        <div
          class="flex items-center mb-2"
          v-for="(asset, i) in assets.slice(0, showAll ? assets.length : 4)"
          :key="asset.address"
        >
          <div class="bg-gray-700 p-2 rounded-lg mr-4 relative">
            <BalAsset :address="asset.address" :size="32" />
            <div
              v-if="asset.percentOfPortfolio >= 0.03"
              class="rounded-full h-3 w-3 bg-green-500 absolute -top-1 -left-1"
              :style="{ backgroundColor: chartColors[i] }"
            ></div>
          </div>
          <div class="flex-1">
            <div class="text-md font-medium">{{ asset.symbol }}</div>
            <div class="text-sm text-gray-500 font-medium">
              {{ fNum(asset.percentOfPortfolio, 'percent') }}
            </div>
          </div>
          <div class="text-md font-medium text-right">
            {{ fNum(asset.balance, 'token') }}
            <div class="text-sm text-gray-500 font-medium text-right">
              {{ fNum(asset.totalValue, 'usd') }}
            </div>
          </div>
        </div>

        <div class="text-center mt-6" v-if="assets.length > 4">
          <a
            @click="toggleShowAll()"
            class="text-green-500 font-medium underline"
          >
            {{ showAll ? 'Hide' : `Show all (${assets.length})` }}
          </a>
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
import useTailwind from '@/composables/useTailwind';
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { chartColors } from '@/constants/colors';
import { UserTokenData } from '@/services/beethovenx/beethovenx-types';
import { sumBy } from 'lodash';
import useNumbers from '@/composables/useNumbers';

export default defineComponent({
  props: {
    assets: {
      type: Array as PropType<UserTokenData[]>,
      required: true
    },
    isLoading: {
      type: Boolean
    }
  },
  components: {
    BalCard,
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const tailwind = useTailwind();
    const { fNum } = useNumbers();
    const showAll = ref(false);

    const mainAssets = computed(() => props.assets.slice(0, 4));

    const chartConfig = computed(() => {
      const majorAssets = props.assets.filter(
        asset => asset.percentOfPortfolio >= 0.03
      );
      const others = props.assets.filter(
        asset => asset.percentOfPortfolio < 0.03
      );
      const othersValue = sumBy(others, 'totalValue');

      return {
        tooltip: {
          trigger: 'item',
          backgroundColor: tailwind.theme.colors.gray['800'],
          borderColor: tailwind.theme.colors.gray['800'],
          formatter: param => {
            return `
          <div class='flex flex-col font-body bg-white dark:bg-gray-800 dark:text-white'>
            <span>${param.marker} ${
              param.name
            }<span class='font-medium ml-2'>${fNum(param.value, 'usd')}
                  </span>
                </span>
          </div>
          `;
          }
        },
        legend: {
          show: false
        },
        series: [
          {
            name: 'My Assets',
            type: 'pie',
            radius: ['45%', '95%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: tailwind.theme.colors.gray['850'],
              borderWidth: 2
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '14',
                fontWeight: 'bold'
              }
            },
            label: {
              position: 'inside',
              fontWeight: 'bold',
              color: '#FFFFFF'
            },
            data: [
              ...majorAssets.map(asset => ({
                name: asset.symbol,
                value: Math.round(asset.totalValue * 100) / 100
              })),
              ...(othersValue > 0
                ? [
                    {
                      name: 'Other',
                      value: othersValue
                    }
                  ]
                : [])
            ],
            color: chartColors
          }
        ]
      };
    });

    function toggleShowAll() {
      showAll.value = !showAll.value;
    }

    return {
      chartInstance,
      numeral,
      chartConfig,
      mainAssets,
      fNum,
      chartColors,
      showAll,
      toggleShowAll
    };
  }
});
</script>
