<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

import useProtocolRewardsQuery from '@/composables/queries/useProtocolRewardsQuery';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { feeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';
import useWeb3 from '@/services/web3/useWeb3';

import TxActionBtn from './TxActionBtn/TxActionBtn.vue';

/**
 * TYPES
 */
type Props = {
  tokenAddress?: string;
  fiatValue: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { fNum2 } = useNumbers();
const { account } = useWeb3();
const protocolRewardsQuery = useProtocolRewardsQuery();

/**
 * METHODS
 */
function claimTx() {
  if (props.tokenAddress)
    return feeDistributor.claimBalance(account.value, props.tokenAddress);
  return feeDistributor.claimBalances(account.value);
}
</script>

<template>
  <TxActionBtn
    :label="tokenAddress ? $t('claim') : $t('claimAll')"
    color="gradient"
    size="sm"
    :actionFn="claimTx"
    :onConfirmFn="protocolRewardsQuery.refetch.value"
    action="claim"
    :summary="`${t('claim')} ${fNum2(fiatValue, FNumFormats.fiat)}`"
    :confirmingLabel="$t('claiming')"
    v-bind="$attrs"
  />
</template>
