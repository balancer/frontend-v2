<script lang="ts" setup>
import { getAddress } from '@ethersproject/address';
import { useI18n } from 'vue-i18n';

import useGaugesDecorationQuery from '@/composables/queries/useGaugesDecorationQuery';
import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { LiquidityGaugeRewardsHelper } from '@/services/balancer/contracts/contracts/gauge-reward-helper';
import { Gauge } from '@/services/balancer/gauges/types';

import TxActionBtn from '../TxActionBtn/TxActionBtn.vue';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';

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
const { fNum } = useNumbers();
const { data: subgraphGauges } = useGaugesQuery();
const { account } = useWeb3();
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
  if (props.gauge.streamer) {
    const liquidityGaugeRewardsHelperContract = new LiquidityGaugeRewardsHelper(
      configService.network.addresses.gaugeRewardsHelper || ''
    );
    return liquidityGaugeRewardsHelperContract.claimRewardsForGauge(
      gaugeAddress,
      account.value
    );
  }
  return liquidityGaugeContract.claimRewards();
}
</script>

<template>
  <TxActionBtn
    :label="t('claimAll')"
    color="gradient"
    size="sm"
    :actionFn="claimTx"
    :onConfirmFn="gaugesQuery.refetch"
    action="claim"
    :summary="`${t('claim')} ${fNum(props.fiatValue, FNumFormats.fiat)}`"
    :confirmingLabel="t('claiming')"
  />
</template>
