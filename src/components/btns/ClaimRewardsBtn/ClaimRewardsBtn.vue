<script lang="ts" setup>
import { getAddress } from '@ethersproject/address';
import { useI18n } from 'vue-i18n';

import useGaugesDecorationQuery from '@/composables/queries/useGaugesDecorationQuery';
import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { Gauge } from '@/services/balancer/gauges/types';

import TxActionBtn from '../TxActionBtn/TxActionBtn.vue';

/**
 * TYPES
 */
type Props = {
  gauge: Gauge;
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
const { data: subgraphGauges } = useGaugesQuery();
const gaugesQuery = useGaugesDecorationQuery(subgraphGauges);

/**
 * STATE
 */
const gaugeAddress = getAddress(props.gauge.id);
const liquidityGaugeContract = new LiquidityGauge(gaugeAddress);

/**
 * METHODS
 */
function claimTx() {
  return liquidityGaugeContract.claimRewards();
}
</script>

<template>
  <TxActionBtn
    :label="t('claimAll')"
    color="gradient"
    size="sm"
    :actionFn="claimTx"
    :onConfirmFn="gaugesQuery.refetch.value"
    action="claim"
    :summary="`${t('claim')} ${fNum2(props.fiatValue, FNumFormats.fiat)}`"
    :confirmingLabel="t('claiming')"
  />
</template>
