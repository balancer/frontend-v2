<script setup lang="ts">
import { prominent } from 'color.js';
import * as echarts from 'echarts/core';
import { computed, nextTick, ref, watch } from 'vue';
import ECharts from 'vue-echarts';

import usePoolCreation from '@/composables/pools/usePoolCreation';
import useBreakpoints from '@/composables/useBreakpoints';
import useDarkMode from '@/composables/useDarkMode';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTailwind from '@/composables/useTailwind';
import useTokens from '@/composables/useTokens';
import useUrls from '@/composables/useUrls';

/**
 * CONSTANTS
 */
const manualColorMap = {
  ETH: '#627EEA',
  WETH: '#627EEA',
  WBTC: '#F7931A',
  BAL: '#00265A',
};

/** STATE */
const colors = ref<(string | null)[]>([]);
const chartInstance = ref<echarts.ECharts>();

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const {
  seedTokens,
  updateTokenColors,
  totalLiquidity,
  tokensList,
  hasRestoredFromSavedState,
} = usePoolCreation();
const { upToLargeBreakpoint } = useBreakpoints();
const { darkMode } = useDarkMode();
const { fNum2 } = useNumbers();
const tailwind = useTailwind();
const { resolve } = useUrls();

/**
 * COMPUTED
 */
const chartConfig = computed(() => {
  const validTokens = tokensList.value.filter(t => t !== '');
  if (colors.value.length !== validTokens.length) return;
  return {
    tooltip: {
      show: true,
      borderRadius: 50,
      confine: true,
    },
    legend: {
      show: true,
      type: 'scroll',
      icon: 'circle',
      formatter: address => {
        return `${getToken(address)?.symbol || 'Unallocated'}`;
      },
      selectedMode: false,
      top: 'bottom',
      textStyle: {
        color: darkMode.value
          ? tailwind.theme.colors.gray['300']
          : tailwind.theme.colors.gray['850'],
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        stillShowZeroSum: true,
        showEmptyCircle: true,
        itemStyle: {
          borderColor: darkMode.value
            ? tailwind.theme.colors.gray['850']
            : '#fff',
          borderWidth: 5,
          borderCap: 'butt',
          borderJoin: 'round',
        },
        label: {
          show: false,
          position: 'center',
        },
        labelLine: {
          show: false,
        },
        top: -20,
        colors: colors.value,
        data: [
          ...seedTokens.value
            // .filter(t => t.tokenAddress !== '')
            .map((t, i) => {
              const tokenLogoURI = resolve(
                getToken(t.tokenAddress)?.logoURI || ''
              );
              return {
                name: t.tokenAddress,
                value: t.weight,
                tooltip: {
                  show: false,
                  borderWidth: '0',
                },
                emphasis: {
                  label: {
                    show: true,
                    formatter: () => ' ',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    backgroundColor: {
                      image: tokenLogoURI,
                    },
                    width: 48,
                    height: 48,
                    borderRadius: 48,
                    overflow: 'hidden',
                  },
                },
                itemStyle: {
                  color:
                    t.tokenAddress === ''
                      ? tailwind.theme.colors.gray[`${i + 1}00`]
                      : colors.value[i],
                },
              };
            }),
        ],
      },
    ],
  };
});

/**
 * WATCHERS
 */
watch(
  [seedTokens, hasRestoredFromSavedState],
  async () => {
    const colors = await calculateColors();
    await nextTick();
    updateTokenColors(colors as string[]);
  },
  { deep: true, immediate: true }
);

/**
 * FUNCTIONS
 */
async function calculateColors() {
  const colorPromises = seedTokens.value
    .filter(t => t.tokenAddress !== '')
    .map(async t => {
      try {
        const token = getToken(t.tokenAddress);
        const tokenLogoURI = resolve(token.logoURI || '');
        const color = await prominent(tokenLogoURI, {
          amount: 2,
          format: 'hex',
        });
        if (manualColorMap[token.symbol]) {
          return manualColorMap[token.symbol];
        }
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
}
</script>

<template>
  <BalCard noPad shadow="none">
    <div v-if="!upToLargeBreakpoint" class="p-4 border-b dark:border-gray-600">
      <h6 class="dark:text-gray-300">
        {{ $t('createAPool.poolSummary') }}
      </h6>
    </div>
    <div class="p-2">
      <ECharts
        ref="chartInstance"
        class="w-full h-56"
        :option="chartConfig"
        autoresize
      />
    </div>
    <BalStack class="mb-2" vertical spacing="none" align="center">
      <BalStack horizontal spacing="xs">
        <h6>{{ $t('inYourWallet') }}</h6>
        <BalTooltip iconSize="sm" class="mt-1">
          {{ $t('createAPool.maxLiquidityTooltip') }}
        </BalTooltip>
      </BalStack>
      <span>{{ fNum2(totalLiquidity.toString(), FNumFormats.fiat) }}</span>
    </BalStack>
  </BalCard>
</template>
