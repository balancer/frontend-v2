<script lang="ts" setup>
import useGaugesDecorationQuery from '@/composables/queries/useGaugesDecorationQuery';
import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import useEthers from '@/composables/useEthers';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useTransactions from '@/composables/useTransactions';
import { LiquidityGauge } from '../../../services/balancer/contracts/contracts/liquidity-gauge';
import { Gauge } from '@/services/balancer/gauges/types';
import { getAddress } from '@ethersproject/address';
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';

/**
 * TYPES
 */
type Props = {
  gauge: Gauge;
  value: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { addTransaction } = useTransactions();
const { fNum2 } = useNumbers();
const { txListener } = useEthers();
const { data: subgraphGauges } = useGaugesQuery();
const gaugesQuery = useGaugesDecorationQuery(subgraphGauges);

/**
 * STATE
 */
const state = reactive({
  confirming: false
});
const gaugeAddress = getAddress(props.gauge.id);
const liquidityGaugeContract = new LiquidityGauge(gaugeAddress);

/**
 * METHODS
 */
async function claim() {
  const tx = await liquidityGaugeContract.claimRewards();
  state.confirming = true;

  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'claim',
    summary: `${t('claim')} ${fNum2(props.value, FNumFormats.fiat)}`
  });

  await txListener(tx, {
    onTxConfirmed: async () => {
      await gaugesQuery.refetch.value();
      state.confirming = false;
    },
    onTxFailed: () => {
      console.error('Claim failed');
      state.confirming = false;
    }
  });
}
</script>

<template>
  <BalBtn
    :label="$t('claimAll')"
    :loadingLabel="$t('claiming')"
    color="gradient"
    size="sm"
    :loading="state.confirming"
    :disabled="state.confirming"
    @click.stop="claim"
  />
</template>
