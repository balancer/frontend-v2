<script lang="ts" setup>
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { Pool, PoolAPRs } from '@/services/pool/types';
import { hasBalEmissions } from '@/services/staking/utils';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  poolApr?: PoolAPRs;
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

const apr = computed(() => props.pool?.apr || props.poolApr);

const boost = computed((): string => props.pool?.boost || '');
const hasBoost = computed((): boolean => !!boost.value);
const stakingAPR = computed((): PoolAPRs['staking'] => apr.value?.staking);
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
  if (apr.value && hasBalEmissions(apr.value)) {
    const boostedStakingAPR = bnum(minBalAPR.value)
      .times(boost.value)
      .plus(rewardTokensAPR.value)
      .toString();

    return fNum2(boostedStakingAPR, FNumFormats.percent);
  }

  return fNum2(rewardTokensAPR.value, FNumFormats.percent);
});

/**
 * @summary The total APR if we have don't have the user's boost.
 */
const unboostedTotalAPR = computed((): string =>
  fNum2(
    bnum(minBalAPR.value).plus(rewardTokensAPR.value).toString(),
    FNumFormats.percent
  )
);

const breakdownItems = computed((): Array<any> => {
  const items: Array<any> = [];

  items.push(['Min BAL', minBalAPR.value], ['Max BAL', maxBalAPR.value]);

  if (hasRewardTokens.value) items.push(['Rewards', rewardTokensAPR.value]);

  return items;
});
</script>

<template>
  <div>
    <div v-if="hasBoost">
      <div class="flex items-center">
        {{ boostedTotalAPR }}
        <span class="ml-1 text-secondarytext-xs">
          {{ $t('staking.stakingApr') }}
        </span>
      </div>
    </div>
    <template v-else>
      <BalBreakdown v-if="hasBalEmissions(apr)" :items="breakdownItems">
        <div class="flex items-center">
          {{ unboostedTotalAPR }}
          <span class="ml-1 text-xs text-secondary">
            {{ $t('staking.minimumStakingApr') }}
          </span>
        </div>
        <template #item="{ item: [label, amount] }">
          {{ fNum2(amount, FNumFormats.percent) }}
          <span class="ml-1 text-xs capitalize text-secondary">
            {{ label }} {{ $t('apr') }}
          </span>
        </template>
      </BalBreakdown>
      <div v-else-if="hasRewardTokens" class="flex items-center">
        {{ fNum2(rewardTokensAPR, FNumFormats.percent) }}
        <span class="ml-1 text-xs text-secondary">
          {{ $t('staking.stakingApr') }}
        </span>
      </div>
    </template>
  </div>
</template>
