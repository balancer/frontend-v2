<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isStablePhantom, isWstETH } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { APR_THRESHOLD } from '@/constants/poolAPR';
import { bnum } from '@/lib/utils';
import { DecoratedPool } from '@/services/balancer/subgraph/types';
import {
  getAprRangeWithRewardEmissions,
  getBoostAdjustedTotalAPR,
  hasBALEmissions,
  hasStakingRewards
} from '@/services/staking/utils';

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
const validAPR = computed(
  () => Number(props.pool.dynamic.apr.total) * 100 <= APR_THRESHOLD
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

const totalAPRRange = computed(() => {
  const adjustedRange = getAprRangeWithRewardEmissions(props.pool);
  return adjustedRange;
});

/** METHODS */
function getFlattenedStakingAPRItems(pool: DecoratedPool) {
  const items: Record<string, string> = {};
  if (hasBALEmissions(pool)) {
    (items['Min BAL'] = pool.dynamic.apr.staking?.BAL.min || '0'),
      (items['Max BAL'] = pool.dynamic.apr.staking?.BAL.max || '0');
  }
  if (bnum(pool.dynamic.apr.staking?.Rewards || '0').gt(0)) {
    items['Rewards'] = pool.dynamic.apr.staking?.Rewards || '0';
  }
  return items;
}

function getTotalRewardsAPR(pool: DecoratedPool) {
  return bnum(pool.dynamic.apr.staking?.Rewards || '0').plus(
    pool.dynamic.apr.total
  );
}
</script>

<template v-slot:aprCell="pool">
  <BalTooltip width="auto" noPad v-if="validAPR">
    <template v-slot:activator>
      <div class="ml-1">
        <StarsIcon
          v-if="hasThirdPartyAPR || hasStakingRewards(pool)"
          class="h-4 text-yellow-300 -mr-1"
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
        <div v-if="pool.dynamic.boost">
          {{
            fNum2(
              getBoostAdjustedTotalAPR(pool, pool.dynamic.boost),
              FNumFormats.percent
            )
          }}
        </div>
        <div v-else-if="hasStakingRewards(pool)">
          <div class="text-lg" v-if="hasBALEmissions(pool)">
            {{ fNum2(totalAPRRange.min, FNumFormats.percent) }}-
            {{ fNum2(totalAPRRange.max, FNumFormats.percent) }}
          </div>
          <div v-else>
            {{
              fNum2(getTotalRewardsAPR(pool).toString(), FNumFormats.percent)
            }}
          </div>
        </div>
        <div class="text-lg" v-else>
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
        <BalBreakdown v-if="hasStakingRewards(pool) && pool.dynamic.boost">
          <div class="flex items-center">
            {{
              fNum2(
                getBoostAdjustedTotalAPR(pool, pool.dynamic.boost),
                FNumFormats.percent
              )
            }}
            <span class="ml-1 text-gray-500 text-xs">
              {{ $t('staking.stakingApr') }}
            </span>
          </div>
        </BalBreakdown>
        <BalBreakdown
          v-if="
            hasStakingRewards(pool) &&
              !pool.dynamic.boost &&
              !hasBALEmissions(pool)
          "
        >
          <div class="flex items-center">
            {{
              fNum2(
                pool.dynamic.apr.staking?.Rewards || '0',
                FNumFormats.percent
              )
            }}
            <span class="ml-1 text-gray-500 text-xs">
              {{ $t('staking.stakingApr') }}
            </span>
          </div>
        </BalBreakdown>
        <BalBreakdown
          :items="Object.entries(getFlattenedStakingAPRItems(pool))"
          v-if="
            hasStakingRewards(pool) &&
              !pool.dynamic.boost &&
              hasBALEmissions(pool)
          "
        >
          <div class="flex items-center">
            {{
              fNum2(
                pool.dynamic.apr.staking?.BAL.min || '0',
                FNumFormats.percent
              )
            }}
            <span class="ml-1 text-gray-500 text-xs">
              {{ $t('staking.minimumStakingApr') }}
            </span>
          </div>
          <template #item="{ item }">
            {{ fNum2(item[1], FNumFormats.percent) }}
            <span class="text-gray-500 text-xs ml-1 capitalize">
              {{ item[0] }} {{ $t('apr') }}
            </span>
          </template>
        </BalBreakdown>
      </div>
    </div>
  </BalTooltip>
</template>
