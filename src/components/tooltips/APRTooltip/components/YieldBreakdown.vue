<script lang="ts" setup>
import { Pool } from '@/services/pool/types';
import { getAddress } from '@ethersproject/address';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isDeep } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { PoolAPRs } from '@/services/pool/types';

/**
 * TYPES
 */
type Props = {
  yieldAPR: PoolAPRs['yield'];
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getTokens } = useTokens();
const { fNum2 } = useNumbers();
const { t } = useI18n();

/**
 * COMPUTED
 */
const yieldAPRTokens = computed(() =>
  getTokens(Object.keys(props.yieldAPR.breakdown))
);

const hasMultiRewardTokens = computed(
  () => Object.keys(yieldAPRTokens.value).length > 1
);

const yieldAPRLabel = computed(() => {
  if (includesWstEth(props.pool.tokensList))
    return t('yieldAprRewards.apr.steth');
  if (isDeep(props.pool)) return t('yieldAprRewards.apr.boosted');

  return '';
});

const yieldBreakdownItems = computed((): [string, string][] =>
  Object.entries(props.yieldAPR.breakdown)
);
</script>

<template>
  <BalBreakdown :items="yieldBreakdownItems" :hideItems="!hasMultiRewardTokens">
    <div class="flex items-center">
      {{ fNum2(yieldAPR.total, FNumFormats.percent) }}
      <span class="ml-1 text-xs text-secondary">
        {{ yieldAPRLabel }}
      </span>
    </div>
    <template v-if="hasMultiRewardTokens" #item="{ item: [address, amount] }">
      {{ fNum2(amount, FNumFormats.percent) }}
      <span class="ml-1 text-xs text-secondary">
        {{ yieldAPRTokens[getAddress(address)].symbol }} {{ $t('apr') }}
      </span>
    </template>
  </BalBreakdown>
</template>
