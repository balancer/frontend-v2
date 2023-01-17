<script lang="ts" setup>
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { hasBalEmissions } from '@/services/staking/utils';
import { AprBreakdown } from '@balancer-labs/sdk';
import { useTokens } from '@/providers/tokens.provider';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  poolApr?: AprBreakdown;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum2 } = useNumbers();
const { getToken } = useTokens();

/**
 * COMPUTED
 */

const apr = computed(() => props.pool?.apr || props.poolApr);

const boost = computed((): string => props.pool?.boost || '');
const hasBoost = computed((): boolean => !!boost.value);
const stakingAPR = computed(
  (): AprBreakdown['stakingApr'] | undefined => apr.value?.stakingApr
);
const isMinMaxSame = computed(
  (): boolean => stakingAPR.value?.min === stakingAPR.value?.max
);
const minBalAPR = computed((): number => stakingAPR.value?.min || 0);
const maxBalAPR = computed((): number => stakingAPR.value?.max || 0);
const rewardTokensAPR = computed(
  (): number => apr.value?.rewardAprs.total || 0
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

    return fNum2(boostedStakingAPR, FNumFormats.bp);
  }

  return fNum2(rewardTokensAPR.value, FNumFormats.bp);
});

/**
 * @summary The total APR if we have don't have the user's boost.
 */
const unboostedTotalAPR = computed((): string =>
  fNum2(
    bnum(minBalAPR.value).plus(rewardTokensAPR.value).toString(),
    FNumFormats.bp
  )
);

const breakdownItems = computed((): Array<any> => {
  const items: Array<any> = [];

  if (!isMinMaxSame.value) {
    items.push(['Min BAL', minBalAPR.value], ['Max BAL', maxBalAPR.value]);
  }

  if (hasRewardTokens.value) {
    if (isMinMaxSame.value) {
      items.push(['BAL', minBalAPR.value]);
    }

    const rewardAprTokens = apr.value?.rewardAprs.breakdown;
    if (rewardAprTokens) {
      Object.keys(rewardAprTokens).forEach(address => {
        items.push([
          getToken(address)?.symbol || 'Rewards',
          rewardAprTokens[address],
        ]);
      });
    } else {
      items.push(['Rewards', rewardTokensAPR.value]);
    }
  }

  return items;
});
</script>

<template>
  <div data-testid="staking-apr">
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
            {{
              isMinMaxSame
                ? $t('staking.stakingApr')
                : $t('staking.minimumStakingApr')
            }}
          </span>
        </div>
        <template #item="{ item: [label, amount] }">
          {{ fNum2(amount, FNumFormats.bp) }}
          <span class="ml-1 text-xs capitalize text-secondary">
            {{ label }} {{ $t('apr') }}
          </span>
        </template>
      </BalBreakdown>
      <div v-else-if="hasRewardTokens" class="flex items-center">
        {{ fNum2(rewardTokensAPR, FNumFormats.bp) }}
        <span class="ml-1 text-xs text-secondary">
          {{ $t('staking.stakingApr') }}
        </span>
      </div>
    </template>
  </div>
</template>
