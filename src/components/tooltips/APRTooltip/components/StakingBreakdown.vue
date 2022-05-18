<script lang="ts" setup>
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { DecoratedPool, PoolAPRs } from '@/services/balancer/subgraph/types';
import {
  getBoostAdjustedTotalAPR,
  hasBALEmissions
} from '@/services/staking/utils';

/**
 * TYPES
 */
type Props = {
  pool: DecoratedPool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const boost = computed((): string => props.pool.dynamic?.boost || '');
const hasBoost = computed((): boolean => !!boost.value);
const stakingAPR = computed(
  (): PoolAPRs['staking'] => props.pool.dynamic.apr.staking
);
const minBalAPR = computed((): string => stakingAPR.value?.bal.min || '0');
const maxBalAPR = computed((): string => stakingAPR.value?.bal.max || '0');
const rewardTokensAPR = computed(
  (): string => stakingAPR.value?.rewards || '0'
);
const hasRewardTokens = computed((): boolean =>
  bnum(rewardTokensAPR.value).gt(0)
);

/**
 * @summary The total APR if we have the user's boost.
 */
const boostedTotalAPR = computed((): string => {
  if (hasBALEmissions(props.pool))
    return fNum2(
      getBoostAdjustedTotalAPR(props.pool, boost.value),
      FNumFormats.percent
    );

  return fNum2(
    props.pool.dynamic?.apr.staking?.rewards || '0',
    FNumFormats.percent
  );
});

/**
 * @summary The total APR if we have don't have the user's boost.
 */
const unboostedTotalAPR = computed((): string =>
  fNum2(
    bnum(minBalAPR.value)
      .plus(rewardTokensAPR.value)
      .toString(),
    FNumFormats.percent
  )
);

const breakdownItems = computed(
  (): Array<any> => {
    const items: Array<any> = [];

    items.push(['Min BAL', minBalAPR.value], ['Max BAL', maxBalAPR.value]);

    if (hasRewardTokens.value) items.push(['Rewards', rewardTokensAPR.value]);

    return items;
  }
);
</script>

<template>
  <div>
    <div v-if="hasBoost">
      <div class="flex items-center">
        {{ boostedTotalAPR }}
        <span class="ml-1 text-gray-500 text-xs">
          {{ $t('staking.stakingApr') }}
        </span>
      </div>
    </div>
    <template v-else>
      <BalBreakdown v-if="hasBALEmissions(pool)" :items="breakdownItems">
        <div class="flex items-center">
          {{ unboostedTotalAPR }}
          <span class="ml-1 text-gray-500 text-xs">
            {{ $t('staking.minimumStakingApr') }}
          </span>
        </div>
        <template #item="{ item: [label, amount] }">
          {{ fNum2(amount, FNumFormats.percent) }}
          <span class="text-gray-500 text-xs ml-1 capitalize">
            {{ label }} {{ $t('apr') }}
          </span>
        </template>
      </BalBreakdown>
      <div v-else-if="hasRewardTokens" class="flex items-center">
        {{ fNum2(rewardTokensAPR, FNumFormats.percent) }}
        <span class="ml-1 text-gray-500 text-xs">
          {{ $t('staking.stakingApr') }}
        </span>
      </div>
    </template>
  </div>
</template>
