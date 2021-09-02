<template v-slot:aprCell="pool">
  <BalTooltip v-if="pool.hasLiquidityMiningRewards" noPad>
    <template v-slot:activator>
      <StarsIcon
        class="ml-1 h-5 text-yellow-300"
        v-if="pool.hasLiquidityMiningRewards"
        v-bind="$attrs"
      />
    </template>
    <div class="text-sm divide-y dark:divide-gray-900">
      <div class="px-3 pt-3 pb-1 bg-gray-50 dark:bg-gray-800 rounded-t">
        <div class="text-gray-500">{{ $t('totalAPR') }}</div>
        <div class="text-lg">
          {{ fNum(pool.dynamic.apr.total, 'percent') }}
        </div>
      </div>
      <div class="p-3">
        <div class="whitespace-nowrap flex items-center mb-1">
          {{ fNum(pool.dynamic.apr.pool, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs">{{ $t('swapFeeAPR') }}</span>
        </div>
        <div
          v-if="hasThirdPartyAPR"
          class="whitespace-nowrap flex items-center mb-1"
        >
          {{ fNum(pool.dynamic.apr.thirdParty, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs">
            {{ thirdPartyAPRLabel }}
          </span>
        </div>
        <div class="whitespace-nowrap flex items-center">
          {{ fNum(pool.dynamic.apr.liquidityMining, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs flex items-center">
            {{ $t('liquidityMiningAPR') }}
            <StarsIcon class="h-4 text-yellow-300" />
          </span>
        </div>
        <div
          v-if="multiRewardPool"
          class="whitespace-nowrap flex flex-col mt-2 ml-px"
        >
          <div
            v-for="(apr, address, index) in lmBreakdown"
            :key="address"
            class="flex items-center"
          >
            <div v-if="index === 0" class="init-vert-bar" />
            <div v-else class="vert-bar" />
            <div class="horiz-bar" />
            {{ fNum(apr, 'percent') }}
            <span class="text-gray-500 text-xs ml-2">
              {{ lmTokens[address].symbol }} {{ $t('apr') }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </BalTooltip>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue';
import useNumbers from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';
import { isWstETH } from '@/composables/usePool';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'LiquidityMiningTooltip',

  props: {
    pool: {
      type: Object as PropType<DecoratedPool>,
      required: true
    }
  },

  setup(props) {
    /**
     * COMPOSABLES
     */
    const { fNum } = useNumbers();
    const { getTokens } = useTokens();
    const { t } = useI18n();

    /**
     * COMPUTED
     */
    const lmBreakdown = computed(
      () => props.pool.dynamic.apr.liquidityMiningBreakdown
    );

    const lmTokens = computed(() => getTokens(Object.keys(lmBreakdown.value)));

    const multiRewardPool = computed(
      () => Object.keys(lmTokens.value).length > 1
    );

    const hasThirdPartyAPR = computed(() =>
      bnum(props.pool.dynamic.apr.thirdParty).gt(0)
    );

    const thirdPartyAPRLabel = computed(() => {
      if (isWstETH(props.pool)) return t('thirdPartyAPR.steth');
      return '';
    });

    return {
      lmBreakdown,
      fNum,
      lmTokens,
      multiRewardPool,
      hasThirdPartyAPR,
      thirdPartyAPRLabel
    };
  }
});
</script>

<style scoped>
.horiz-bar {
  @apply h-px w-3 bg-gray-200 dark:bg-gray-700 mr-2;
}

.init-vert-bar {
  @apply w-px h-4 bg-gray-200 dark:bg-gray-700 -mt-4 -mr-px;
}

.vert-bar {
  @apply w-px h-8 bg-gray-200 dark:bg-gray-700 -mt-8 -mr-px;
}
</style>
