<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { bnum } from '@/lib/utils';
import { PoolSwap } from '@/services/balancer/subgraph/types';

type Props = {
  stats: {
    label: string;
    value: string;
  };
};

const { fNum2 } = useNumbers();
const { t } = useI18n();
const { priceFor } = useTokens();
const props = defineProps<Props>();

// const statsR = computed(() => {
//   if (!props.poolSwaps || !props.poolSwaps.length) {
//     return [];
//   }
//   const poolSwapsLength = props.poolSwaps.length;

//   const largestValue = props.poolSwaps.reduce((prev, current) =>
//     Number(prev.tokenAmountOut) > Number(current.tokenAmountOut)
//       ? prev
//       : current
//   );

//   const avgValue =
//     props.poolSwaps.reduce(
//       (total, current) => total + Number(current.tokenAmountOut),
//       0
//     ) / poolSwapsLength;

//   return [
//     {
//       label: t('poolStats.largestTrade'),
//       value: fNum2(
//         bnum(priceFor(largestValue.tokenOut))
//           .times(largestValue.tokenAmountOut)
//           .toNumber(),
//         { style: 'currency', abbreviate: true }
//       )
//     },
//     {
//       label: t('poolStats.avgTrade'),
//       value: fNum2(
//         bnum(priceFor(largestValue.tokenOut))
//           .times(avgValue)
//           .toNumber(),
//         { style: 'currency', abbreviate: true }
//       )
//     },
//     {
//       label: t('poolStats.investmentsNum'),
//       value: fNum2(poolSwapsLength, { abbreviate: true })
//     }
//   ];
// });
</script>

<template>
  <div class="flex mb-5">
    <BalCard v-for="(stat, i) in stats" :key="i" :class="{ 'ml-5': i > 0 }">
      <div class="text-sm text-gray-500 font-medium mb-2">
        <span>{{ stat.label }}</span>
      </div>
      <div class="text-xl font-bold truncate flex items-center">
        {{ stat.value }}
      </div>
    </BalCard>
  </div>
</template>
