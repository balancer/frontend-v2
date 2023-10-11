<script lang="ts" setup>
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@balancer-labs/sdk';
import { useTokens } from '@/providers/tokens.provider';
import { hasBalEmissions } from '@/composables/useAPR';

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
const { fNum } = useNumbers();
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

    return fNum(boostedStakingAPR, FNumFormats.bp);
  }

  return fNum(rewardTokensAPR.value, FNumFormats.bp);
});

/**
 * @summary The total APR if we have don't have the user's boost.
 */
const unboostedTotalAPR = computed((): string =>
  fNum(
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
    if (isMinMaxSame.value && minBalAPR.value > 0) {
      items.push(['BAL', minBalAPR.value]);
    }

    const rewardAprTokens = apr.value?.rewardAprs.breakdown;
    if (rewardAprTokens) {
      Object.keys(rewardAprTokens).forEach(address => {
        if (rewardAprTokens[address] === 0) return;

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
    <template v-if="hasBoost">
      <BalHStack justify="between" class="font-bold">
        <span>
          {{ $t('staking.stakingApr') }}
        </span>
        {{ boostedTotalAPR }}
      </BalHStack>
    </template>
    <template v-else>
      <BalHStack justify="between" class="font-bold">
        <span>
          {{
            isMinMaxSame
              ? $t('staking.stakingApr')
              : $t('staking.minimumStakingApr')
          }}
        </span>
        {{ unboostedTotalAPR }}
      </BalHStack>
      <BalVStack spacing="xs" class="mt-1">
        <BalHStack
          v-for="([label, amount], i) in breakdownItems"
          :key="i"
          justify="between"
          class="text-gray-500"
        >
          <span class="ml-2">{{ label }} {{ $t('apr') }} </span>
          {{ fNum(amount, FNumFormats.bp) }}
        </BalHStack>
      </BalVStack>
    </template>
  </div>
</template>
