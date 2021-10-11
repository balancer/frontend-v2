<template v-slot:aprCell="pool">
  <BalTooltip v-if="pool.hasLiquidityMiningRewards" noPad>
    <template v-slot:activator>
      <div class="ml-1">
        <StarsIcon
          class="h-5 text-yellow-300"
          v-if="pool.hasLiquidityMiningRewards"
          v-bind="$attrs"
        />
      </div>
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
        <BalStatBreakdown
          :items="Object.entries(lmBreakdown)"
          :hideItems="!multiRewardPool"
        >
          {{ fNum(pool.dynamic.apr.liquidityMining, 'percent') }}
          <span class="ml-1 text-gray-500 text-xs flex items-center">
            {{ $t('liquidityMiningAPR') }}
            <StarsIcon class="h-4 text-yellow-300" />
          </span>
          <template v-if="multiRewardPool" v-slot:item="{ item }">
            {{ fNum(item[1], 'percent') }}
            <span class="text-gray-500 text-xs ml-2">
              {{ lmTokens[item[0]].symbol }} {{ $t('apr') }}
            </span>
          </template>
        </BalStatBreakdown>
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
      if (isWstETH(props.pool)) return t('thirdPartyRewards.apr.steth');
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
