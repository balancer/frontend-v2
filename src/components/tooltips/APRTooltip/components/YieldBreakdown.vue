<script lang="ts" setup>
import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import {
  hasBoostedAPR,
  isDeep,
  isVeBalPoolAddress,
} from '@/composables/usePool';
import { useTokens } from '@/providers/tokens.provider';

/**
 * TYPES
 */
type Props = {
  yieldAPR: AprBreakdown['tokenAprs'];
  pool: Pool;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { getToken, getTokens } = useTokens();
const { fNum2 } = useNumbers();
const { t } = useI18n();

/**
 * COMPUTED
 */
const yieldAPRTokens = computed(() => {
  return getTokens(Object.keys(props.yieldAPR.breakdown));
});

const hasMultiRewardTokens = computed(
  () => Object.keys(yieldAPRTokens.value).length > 1
);

const yieldAPRLabel = computed(() => {
  const yieldTokensList = Object.keys(props.yieldAPR.breakdown);

  if (isDeep(props.pool)) return t('yieldAprRewards.apr.boosted');

  if (yieldTokensList.length > 1) {
    return t('yieldAprRewards.apr.token');
  }

  if (yieldTokensList.length === 1) {
    if (hasBoostedAPR(yieldTokensList[0]))
      return t('yieldAprRewards.apr.boosted');
    if (isVeBalPoolAddress(yieldTokensList[0]))
      return t('yieldAprRewards.apr.veBAL');

    const tokenAddress = getAddress(yieldTokensList[0]);
    const token = getToken(tokenAddress);

    if (!token) {
      return t('yieldAprRewards.apr.token');
    }

    return `${token.symbol} ${t('apr')}`;
  }

  return '';
});

const yieldBreakdownItems = computed((): [string, number][] =>
  Object.entries(props.yieldAPR.breakdown)
);
</script>

<template>
  <div data-testid="yield-apr">
    <BalBreakdown
      :items="yieldBreakdownItems"
      :hideItems="!hasMultiRewardTokens"
    >
      <div class="flex items-center">
        {{ fNum2(yieldAPR.total, FNumFormats.bp) }}
        <span class="ml-1 text-xs text-secondary"> {{ yieldAPRLabel }} </span>
      </div>
      <template v-if="hasMultiRewardTokens" #item="{ item: [address, amount] }">
        {{ fNum2(amount, FNumFormats.bp) }}
        <span class="ml-1 text-xs text-secondary">
          {{ yieldAPRTokens[getAddress(address)].symbol }} {{ $t('apr') }}
        </span>
      </template>
    </BalBreakdown>
  </div>
</template>
