<script setup lang="ts">
import { TokenWeight } from './ChooseWeights.vue';
import ECharts from 'vue-echarts';
import { computed, nextTick, ref, toRef, toRefs, watch } from 'vue';
import useTokens from '@/composables/useTokens';
import useUrls from '@/composables/useUrls';
import Vibrant from 'node-vibrant/dist/vibrant';
import { prominent } from 'color.js';
import { eq, sumBy } from 'lodash';
import echarts from 'echarts';
import usePoolCreation from '@/composables/pools/usePoolCreation';

const emit = defineEmits(['update:colors']);

const { tokens } = useTokens();
const { tokenWeights } = usePoolCreation();
const { resolve } = useUrls();
const colors = ref<(string | null)[]>([]);
const chartInstance = ref<echarts.ECharts>();

watch(
  tokenWeights,
  async (oldValue, newValue) => {
    await nextTick();
    await calculateColors();
    await nextTick();
    const colors = chartInstance.value?.getOption().color;
    emit('update:colors', colors);
  },
  { deep: true }
);

const calculateColors = async () => {
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
  await nextTick();
  colors.value = _colors;
  await nextTick();
};

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
</script>

<template>
  <BalCard noPad shadow="false">
    <div class="p-2 px-3 border-b">
      <h6>Pool Summary</h6>
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
