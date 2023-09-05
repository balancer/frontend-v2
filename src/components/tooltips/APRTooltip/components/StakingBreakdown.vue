<script lang="ts" setup>
import { computed } from 'vue';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { bnum } from '@/lib/utils';
import { Pool } from '@/services/pool/types';
import { hasBalEmissions, hasStakingRewards } from '@/composables/useAPR';
import {
  GqlBalancePoolAprItem,
  GqlPoolApr,
  GqlPoolAprRange,
} from '@/services/api/graphql/generated/api-types';
import {
  aprMaxOrTotal,
  aprMinOrTotal,
  isAprRange,
  isAprTotal,
} from '@/lib/utils/api';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  items?: GqlBalancePoolAprItem[];
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();

/**
 * COMPUTED
 */

const apr = computed((): GqlPoolApr | undefined => props.pool?.apr);
const boost = computed((): string => props.pool?.boost || '');
const hasBoost = computed((): boolean => !!boost.value);
const stakingAPR = computed((): GqlPoolAprRange | undefined => {
  let apr = { min: bnum(0), max: bnum(0) };
  props.items?.forEach(item => {
    apr.min.plus(aprMinOrTotal(item.apr));
    apr.min.plus(aprMaxOrTotal(item.apr));
  });
  return { min: apr.min.toString(), max: apr.max.toString() };
});
const isMinMaxSame = computed(
  (): boolean => stakingAPR.value?.min === stakingAPR.value?.max
);
const minBalAPR = computed(
  (): number => Number((apr.value?.nativeRewardApr as GqlPoolAprRange).min) || 0
);
const rewardTokensAPR = computed((): number => {
  if (!apr.value) return 0;
  return aprMinOrTotal(apr.value.thirdPartyApr).toNumber();
});

/**
 * @summary The total APR if we have the user's boost.
 */
const boostedTotalAPR = computed((): string => {
  if (apr.value && hasBalEmissions(apr.value)) {
    const boostedStakingAPR = bnum(minBalAPR.value)
      .times(boost.value)
      .plus(rewardTokensAPR.value)
      .toString();

    return fNum(boostedStakingAPR, FNumFormats.percent);
  }

  return fNum(rewardTokensAPR.value, FNumFormats.percent);
});

/**
 * @summary The total APR if we have don't have the user's boost.
 */
const unboostedTotalAPR = computed((): string =>
  fNum(
    bnum(minBalAPR.value).plus(rewardTokensAPR.value).toString(),
    FNumFormats.percent
  )
);

const breakdownItems = computed((): Array<any> => {
  const items: Array<any> = [];

  props.items?.forEach(item => {
    if (isAprRange(item.apr)) {
      items.push(['Min ' + item.title, item.apr.min]);
      items.push(['Max ' + item.title, item.apr.max]);
    }
    if (isAprTotal(item.apr)) {
      items.push([item.title, item.apr.total]);
    }
  });

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
      <BalBreakdown
        v-if="hasBalEmissions(apr) || hasStakingRewards(apr)"
        :items="breakdownItems"
      >
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
          {{ fNum(amount, FNumFormats.percent) }}
          <span class="ml-1 text-xs capitalize text-secondary">
            {{ label }}
          </span>
        </template>
      </BalBreakdown>
    </template>
  </div>
</template>
