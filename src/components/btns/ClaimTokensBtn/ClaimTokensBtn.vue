<script lang="ts" setup>
import { useTokenHelpers } from '@/composables/useTokenHelpers';
import { LiquidityGauge } from '@/services/balancer/contracts/contracts/liquidity-gauge';
import { Gauge } from '@/services/balancer/gauges/types';
import { TokenInfo } from '@/types/TokenList';
import { getAddress } from '@ethersproject/address';

/**
 * TYPES
 */
type Props = {
  token: TokenInfo;
  gauge: Gauge;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { isBalAddress } = useTokenHelpers();

/**
 * STATE
 */
const gaugeAddress = getAddress(props.gauge.id);
const liquidityGaugeContract = new LiquidityGauge(gaugeAddress);

/**
 * METHODS
 */
async function claim() {
  // If token is BAL call BalancerMinter
  if (isBalAddress(props.token.address)) {
    // TODO
  } else {
    // use gauge contract.claimRewards
    await liquidityGaugeContract.claimRewards();
  }
}
</script>

<template>
  <BalBtn label="Claim" color="gradient" size="sm" @click.stop="claim" />
</template>
