<script lang="ts" setup>
import { PoolType } from '@balancer-labs/sdk';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { isStablePhantom } from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { PoolAPRs } from '@/services/pool/types';
import { getAddress } from '@ethersproject/address';

/**
 * TYPES
 */
type Props = {
  yieldAPR: PoolAPRs['yield'];
  poolTokens: string[];
  poolType: PoolType;
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
  if (includesWstEth(props.poolTokens)) return t('yieldAprRewards.apr.steth');
  if (isStablePhantom(props.poolType)) return t('yieldAprRewards.apr.boosted');

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
      <span class="ml-1 text-gray-500 text-xs">
        {{ yieldAPRLabel }}
      </span>
    </div>
    <template v-if="hasMultiRewardTokens" #item="{ item: [address, amount] }">
      {{ fNum2(amount, FNumFormats.percent) }}
      <span class="text-gray-500 text-xs ml-1">
        {{ yieldAPRTokens[getAddress(address)].symbol }} {{ $t('apr') }}
      </span>
    </template>
  </BalBreakdown>
</template>
