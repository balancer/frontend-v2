<template v-slot:apyCell="pool">
  <BalTooltip v-if="pool.hasLiquidityMiningRewards" noPad>
    <template v-slot:activator>
      <StarsIcon
        class="ml-1 h-5 text-yellow-300"
        v-if="pool.hasLiquidityMiningRewards"
        v-bind="$attrs"
      />
    </template>
    <div class="text-sm divide-y">
      <div class="mb-1 px-3 pt-3">
        <div>{{ $t('totalAPY') }}</div>
        <div class="text-lg">
          {{ fNum(pool.dynamic.apy.total, 'percent') }}
        </div>
      </div>
      <div class="p-3">
        <div class="whitespace-nowrap flex items-center">
          {{ fNum(pool.dynamic.apy.pool, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs">{{ $t('swapFeeAPY') }}</span>
        </div>
        <div class="whitespace-nowrap flex items-center">
          {{ fNum(pool.dynamic.apy.liquidityMining, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs flex items-center">
            {{ $t('liquidityMiningAPY') }}
            <StarsIcon class="h-4 text-yellow-300" />
          </span>
        </div>
      </div>
    </div>
  </BalTooltip>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import useNumbers from '@/composables/useNumbers';
import { DecoratedPool } from '@/services/balancer/subgraph/types';

export default defineComponent({
  name: 'LiquidityMiningTooltip',

  props: {
    pool: {
      type: Object as PropType<DecoratedPool>,
      required: true
    }
  },

  setup() {
    const { fNum } = useNumbers();

    return {
      fNum
    };
  }
});
</script>
