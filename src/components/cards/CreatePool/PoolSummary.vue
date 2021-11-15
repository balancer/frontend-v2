<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

import ECharts from 'vue-echarts';
import echarts from 'echarts';

import { TokenWeight } from './ChooseWeights.vue';

import useTokens from '@/composables/useTokens';
import useUrls from '@/composables/useUrls';
import usePoolCreation from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';
import { useI18n } from 'vue-i18n';

import { prominent } from 'color.js';
import { eq, sumBy } from 'lodash';

/** STATE */
const colors = ref<(string | null)[]>([]);
const chartInstance = ref<echarts.ECharts>();

/**
 * COMPOSABLES
 */
const { tokens } = useTokens();
const { tokenWeights, updateTokenColors } = usePoolCreation();
const { upToLargeBreakpoint } = useBreakpoints();
const { t } = useI18n();
const { resolve } = useUrls();

/**
 * COMPUTED
 */
const unallocatedTokenWeight = computed(() =>
  sumBy(
    tokenWeights.value.filter(t => t.tokenAddress === ''),
    'weight'
  )
);

const chartConfig = computed(() => {
  return {
    tooltip: {
      show: true,
      borderRadius: 50,
      confine: true
    },
    legend: {
      show: false
    },
    grid: {
      containLabel: true
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        stillShowZeroSum: true,
        showEmptyCircle: true,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 5,
          borderCap: 'butt',
          borderJoin: 'round'
        },
        label: {
          show: false,
          position: 'center'
        },
        labelLine: {
          show: false
        },
        colors: colors.value,
        data: [
          ...tokenWeights.value
            .filter(t => t.tokenAddress !== '')
            .map((t, i) => {
              const tokenLogoURI = resolve(
                tokens.value[t.tokenAddress].logoURI || ''
              );
              return {
                name: t.tokenAddress,
                value: t.weight,
                tooltip: {
                  formatter: params => {
                    return `<img width="32" height="32" src="${tokenLogoURI}" />`;
                  },
                  borderWidth: '0'
                },
                itemStyle: {
                  color: colors.value[i]
                }
              };
            }),
          {
            name: 'Unallocated',
            value: unallocatedTokenWeight.value,
            itemStyle: {
              color: 'darkGray'
            }
          }
        ]
      }
    ]
  };
});

/**
 * WATCHERS
 */
watch(
  tokenWeights,
  async (oldValue, newValue) => {
    await nextTick();
    const colors = await calculateColors();
    await nextTick();
    updateTokenColors(colors as string[]);
  },
  { deep: true }
);

/**
 * FUNCTIONS
 */
async function calculateColors() {
  const colorPromises = tokenWeights.value
    .filter(t => t.tokenAddress !== '')
    .map(async t => {
      try {
        const tokenLogoURI = resolve(
          tokens.value[t.tokenAddress].logoURI || ''
        );
        const color = await prominent(tokenLogoURI, {
          amount: 2,
          format: 'hex'
        });
        if (color[0] === '#ffffff' || color[0] === '#000000')
          return color[1] as string;
        return color[0] as string;
      } catch {
        return null;
      }
    });
  const _colors = await Promise.all(colorPromises);
  colors.value = _colors;
  return _colors;
};
</script>

<template>
  <BalCard noPad shadow="false">
    <div class="p-2 px-3 border-b" v-if="!upToLargeBreakpoint">
      <h6>{{ $t('createAPool.poolSummary') }}</h6>
    </div>
    <div class="p-2">
      <ECharts
        ref="chartInstance"
        class="w-full h-56"
        :option="chartConfig"
        autoresize
      />
    </div>
  </BalCard>
</template>
