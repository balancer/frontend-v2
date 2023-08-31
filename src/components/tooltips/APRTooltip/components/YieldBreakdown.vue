<script lang="ts" setup>
import { Pool } from '@/services/pool/types';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isDeep } from '@/composables/usePoolHelpers';
import { GqlBalancePoolAprItem } from '@/services/api/graphql/generated/api-types';
import { bnum } from '@/lib/utils';
import { aprMinOrTotal } from '@/lib/utils/api';

/**
 * TYPES
 */
type Props = {
  items: GqlBalancePoolAprItem[];
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { fNum } = useNumbers();
const { t } = useI18n();

/**
 * COMPUTED
 */
const hasMultiRewardTokens = computed(() => props.items.length > 1);

const totalYield = computed<string>(() => {
  const yieldSum = props.items.reduce((total, item) => {
    return aprMinOrTotal(item.apr).toNumber() + total;
  }, 0);

  return bnum(yieldSum).toString();
});

const yieldAPRLabel = computed(() => {
  if (isDeep(props.pool)) return t('yieldAprRewards.apr.boosted');

  if (hasMultiRewardTokens.value) {
    return t('yieldAprRewards.apr.token');
  }

  if (props.items.length === 1) {
    if (props.items[0].title.match(/veBAL/))
      return t('yieldAprRewards.apr.veBAL');

    return `${props.items[0].title}`;
  }

  return '';
});

const yieldBreakdownItems = computed((): [string, number][] => {
  console.log('Items: ', props.items);
  return props.items.map(item => {
    console.log('Item apr: ', item.apr);
    let apr = aprMinOrTotal(item.apr).toNumber();
    console.log(
      'Yield APR: ',
      apr,
      ' percent: ',
      fNum(apr, FNumFormats.percent)
    );
    return [item.title, apr];
  });
});
</script>

<template>
  <div data-testid="yield-apr">
    <BalBreakdown
      :items="yieldBreakdownItems"
      :hideItems="!hasMultiRewardTokens"
    >
      <div class="flex items-center">
        {{ fNum(totalYield, FNumFormats.percent) }}
        <span class="ml-1 text-xs text-secondary"> {{ yieldAPRLabel }} </span>
      </div>
      <template v-if="hasMultiRewardTokens" #item="{ item: [title, amount] }">
        {{ fNum(amount, FNumFormats.percent) }}
        <span class="ml-1 text-xs text-secondary">
          {{ title }}
        </span>
      </template>
    </BalBreakdown>
  </div>
</template>
