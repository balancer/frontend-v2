<script lang="ts" setup>
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { Gauge } from '@/services/balancer/gauges/types';
import { getAddress } from '@ethersproject/address';

/**
 * TYPES
 */
type Props = {
  gauge: Gauge;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const gaugeAddress = getAddress(props.gauge.id);
const liquidityGaugeContract = new LiquidityGauge(gaugeAddress);

/**
 * METHODS
 */
async function claim() {
  await liquidityGaugeContract.claimRewards();
}
</script>

<template>
  <BalBtn label="Claim all" color="gradient" size="sm" @click.stop="claim" />
</template>
