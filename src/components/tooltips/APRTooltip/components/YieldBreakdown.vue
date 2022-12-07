<script lang="ts" setup>
import { Pool } from '@/services/pool/types';
import { AprBreakdown } from '@balancer-labs/sdk';
import { getAddress } from '@ethersproject/address';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import useNumbers, { FNumFormats, bpToDec } from '@/composables/useNumbers';
import {
  hasBoostedAPR,
  isDeep,
  isVeBalPoolAddress,
} from '@/composables/usePool';
import useTokens from '@/composables/useTokens';
import { includesWstEth } from '@/lib/utils/balancer/lido';
import { includesAddress } from '@/lib/utils';
import { configService } from '@/services/config/config.service';

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
const { getTokens } = useTokens();
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
  const poolTokensList = props.pool.tokensList;
  if (includesWstEth(poolTokensList)) return t('yieldAprRewards.apr.steth');
  if (includesAddress(poolTokensList, configService.network.addresses.rETH))
    return t('yieldAprRewards.apr.reth');
  if (includesAddress(poolTokensList, configService.network.addresses.stMATIC))
    return t('yieldAprRewards.apr.stmatic');
  if (isDeep(props.pool)) return t('yieldAprRewards.apr.boosted');

  const yieldTokensList = Object.keys(props.yieldAPR.breakdown);
  if (yieldTokensList.length === 1) {
    if (hasBoostedAPR(yieldTokensList[0]))
      return t('yieldAprRewards.apr.boosted');
    if (isVeBalPoolAddress(yieldTokensList[0]))
      return t('yieldAprRewards.apr.veBAL');
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
        {{ fNum2(bpToDec(yieldAPR.total), FNumFormats.percent) }}
        <span class="ml-1 text-xs text-secondary"> {{ yieldAPRLabel }} </span>
      </div>
      <template v-if="hasMultiRewardTokens" #item="{ item: [address, amount] }">
        {{ fNum2(bpToDec(amount), FNumFormats.percent) }}
        <span class="ml-1 text-xs text-secondary">
          {{ yieldAPRTokens[getAddress(address)].symbol }} {{ $t('apr') }}
        </span>
      </template>
    </BalBreakdown>
  </div>
</template>
