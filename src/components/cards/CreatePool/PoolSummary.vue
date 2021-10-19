<script setup lang="ts">
import { TokenWeight } from './ChooseWeights.vue';
import ECharts from 'vue-echarts';
import { computed, ref, toRef, toRefs, watch } from 'vue';
import useTokens from '@/composables/useTokens';
import useUrls from '@/composables/useUrls';
import Vibrant from 'node-vibrant/dist/vibrant';
import { prominent } from 'color.js';
import { eq } from 'lodash';

type Props = {
  tokens: TokenWeight[];
};
const props = withDefaults(defineProps<Props>(), {
  tokens: [] as any
});
const { tokens } = useTokens();
const { resolve } = useUrls();
const colors = ref<(string | null)[]>([]);

watch(
  () => props.tokens,
  async (oldValue, newValue) => {
    await calculateColors();
  },
  { deep: true }
);

const calculateColors = async () => {
  const colorPromises = props.tokens
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
};

const chartConfig = computed(() => {
  return {
    tooltip: {
      show: true
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
        data: props.tokens
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
          })
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
      <ECharts class="w-full h-56" :option="chartConfig" autoresize />
    </div>
  </BalCard>
</template>
