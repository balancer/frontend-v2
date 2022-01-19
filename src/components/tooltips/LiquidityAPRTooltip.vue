<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTokens from '@/composables/useTokens';
import { isStablePhantom, isWstETH } from '@/composables/usePool';
import { APR_THRESHOLD } from '@/constants/poolAPR';

import { DecoratedPool } from '@/services/balancer/subgraph/types';
import { bnum } from '@/lib/utils';

/**
 * TYPES
 */
type Props = {
  pool: DecoratedPool;
};

/**
 * PROPS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { getTokens } = useTokens();
const { t } = useI18n();

/**
 * COMPUTED
 */
const lmBreakdown = computed(
  () => props.pool.dynamic.apr.liquidityMiningBreakdown
);

const validAPR = computed(
  () => Number(props.pool.dynamic.apr.total) * 100 <= APR_THRESHOLD
);

const lmTokens = computed(() => getTokens(Object.keys(lmBreakdown.value)));

const lmMultiRewardPool = computed(
  () => Object.keys(lmTokens.value).length > 1
);

const hasThirdPartyAPR = computed(() =>
  bnum(props.pool.dynamic.apr.thirdParty).gt(0)
);

const thirdPartyBreakdown = computed(
  () => props.pool.dynamic.apr.thirdPartyBreakdown
);

const thirdPartyTokens = computed(() =>
  getTokens(Object.keys(thirdPartyBreakdown.value))
);

const thirdPartyMultiRewardPool = computed(
  () => Object.keys(thirdPartyTokens.value).length > 1
);

const thirdPartyAPRLabel = computed(() => {
  if (isWstETH(props.pool)) return t('thirdPartyRewards.apr.steth');
  if (isStablePhantom(props.pool.poolType))
    return t('thirdPartyRewards.apr.aaveBoosted');

  return '';
});
</script>

<template v-slot:aprCell="pool">
  <BalTooltip width="auto" noPad v-if="validAPR">
    <template v-slot:activator>
      <div class="ml-1">
        <StarsIcon
          v-if="pool.hasLiquidityMiningRewards || hasThirdPartyAPR"
          class="h-5 text-yellow-300"
          v-bind="$attrs"
        />
        <BalIcon
          v-else
          name="info"
          size="sm"
          class="text-gray-400 dark:text-gray-500"
          v-bind="$attrs"
        />
      </div>
    </template>
    <div class="text-sm divide-y dark:divide-gray-900">
      <div class="px-3 pt-3 pb-1 bg-gray-50 dark:bg-gray-800 rounded-t">
        <div class="text-gray-500">{{ $t('totalAPR') }}</div>
        <div class="text-lg">
          {{ fNum2(pool.dynamic.apr.total, FNumFormats.percent) }}
        </div>
      </div>
      <div class="p-3">
        <div class="whitespace-nowrap flex items-center mb-1">
          {{ fNum2(pool.dynamic.apr.pool, FNumFormats.percent) }}
          <span class="ml-1 text-gray-500 text-xs">{{ $t('swapFeeAPR') }}</span>
        </div>
        <BalBreakdown
          :items="Object.entries(thirdPartyBreakdown)"
          v-if="hasThirdPartyAPR"
          :hideItems="!thirdPartyMultiRewardPool"
        >
          <div class="flex items-center">
            {{ fNum2(pool.dynamic.apr.thirdParty, FNumFormats.percent) }}
            <span class="ml-1 text-gray-500 text-xs">
              {{ thirdPartyAPRLabel }}
            </span>
          </div>
          <template v-if="thirdPartyMultiRewardPool" #item="{ item }">
            {{ fNum2(item[1], FNumFormats.percent) }}
            <span class="text-gray-500 text-xs ml-1">
              {{ thirdPartyTokens[item[0]].symbol }} {{ $t('apr') }}
            </span>
          </template>
        </BalBreakdown>
        <BalBreakdown
          v-if="pool.hasLiquidityMiningRewards"
          :items="Object.entries(lmBreakdown)"
          :hideItems="!lmMultiRewardPool"
        >
          <div class="flex items-center">
            {{ fNum2(pool.dynamic.apr.liquidityMining, FNumFormats.percent) }}
            <span class="ml-1 text-gray-500 text-xs flex items-center">
              {{ $t('liquidityMiningAPR') }}
            </span>
          </div>
          <template v-if="lmMultiRewardPool" #item="{ item }">
            {{ fNum2(item[1], FNumFormats.percent) }}
            <span class="text-gray-500 text-xs ml-1">
              {{ lmTokens[item[0]].symbol }} {{ $t('apr') }}
            </span>
          </template>
        </BalBreakdown>
      </div>
    </div>
  </BalTooltip>
</template>
