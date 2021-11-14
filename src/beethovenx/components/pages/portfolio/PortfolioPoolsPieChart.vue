<template>
  <BalLoadingBlock v-if="isLoading" :style="{ height: '414px' }" />
  <div v-else>
    <BalCard :style="{ minHeight: '414px' }">
      <h4 class="mb-4 mt-1">
        Pools<BalTooltip>
          <template v-slot:activator>
            <BalIcon name="info" size="sm" class="ml-1 text-gray-400 -mb-px" />
          </template>
          <div v-html="$t('portfolioPoolsInfoText')" class="w-52" />
        </BalTooltip>
      </h4>
      <div class="mb-6">
        <ECharts
          ref="chartInstance"
          class="h-44 w-full"
          :option="chartConfig"
          autoresize
          :update-options="{ replaceMerge: 'series' }"
        />
      </div>
      <div
        class="mb-2"
        v-for="(pool, i) in pools.slice(0, showAll ? pools.length : 3)"
        :key="pool.poolId"
      >
        <div class="flex">
          <div
            class="p-2 rounded-lg mr-2 relative w-4 h-4 mt-1 bg-gray-500"
            :style="{
              backgroundColor:
                pool.percentOfPortfolio > 0.03 ? chartColors[i] : ''
            }"
          ></div>
          <div class="text-md font-medium flex-1 truncate">{{ pool.name }}</div>
          <div class="text-md font-medium text-right ml-4">
            {{ fNum(pool.percentOfPortfolio, 'percent') }}
          </div>
        </div>
      </div>
      <div v-if="pools.length > 3" class="text-center mt-6">
        <a
          class="text-green-500 font-medium underline"
          @click="toggleShowAll()"
        >
          {{ showAll ? 'Hide' : `Show all (${pools.length})` }}
        </a>
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
import BalCard from '@/components/_global/BalCard/BalCard.vue';
import { chartColors } from '@/constants/colors';
import { UserPoolData } from '@/services/beethovenx/beethovenx-types';
import { sumBy } from 'lodash';

export default defineComponent({
  props: {
    pools: {
      type: Array as PropType<UserPoolData[]>,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true
    }
  },
  components: {
    BalCard,
    ECharts
  },
  setup(props) {
    const chartInstance = ref<echarts.ECharts>();
    const currentValue = ref('$0,00');
    const change = ref(0);
    const { fNum } = useNumbers();
    const tailwind = useTailwind();
    const showAll = ref(false);

    const chartConfig = computed(() => {
      const majorPools = props.pools.filter(
        pool => pool.percentOfPortfolio >= 0.03
      );
      const others = props.pools.filter(pool => pool.percentOfPortfolio < 0.03);
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
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            data: [
              ...majorPools.map(pool => ({
                name: pool.name,
                value: Math.round(pool.totalValue * 100) / 100
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
      //refs
      chartInstance,

      numeral,

      // data
      currentValue,
      change,

      // computed
      chartConfig,
      chartColors,
      showAll,
      toggleShowAll,
      fNum
    };
  }
});
</script>
