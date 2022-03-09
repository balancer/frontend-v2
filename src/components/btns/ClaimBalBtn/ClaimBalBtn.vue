<script lang="ts" setup>
import { computed } from 'vue';
import { balancerMinter } from '@/services/balancer/contracts/contracts/balancer-minter';
import { Gauge } from '@/services/balancer/gauges/types';
import { getAddress } from '@ethersproject/address';
import useTransactions from '@/composables/useTransactions';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  gauges: Gauge[];
  label: string;
  amount: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { addTransaction } = useTransactions();
const { fNum2 } = useNumbers();

/**
 * COMPUTED
 */
const gaugeAddresses = computed((): string[] =>
  props.gauges.map(gauge => getAddress(gauge.id))
);

/**
 * METHODS
 */
async function claimTx() {
  if (props.gauges.length === 1) {
    return await balancerMinter.mint(gaugeAddresses.value[0]);
  } else {
    return await balancerMinter.mintMany(gaugeAddresses.value);
  }
}

async function claim() {
  const tx = await claimTx();
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'claim',
    summary: `Claim ${fNum2(props.amount, FNumFormats.token)} BAL`
  });
}
</script>

<template>
  <BalBtn :label="label" color="gradient" size="sm" @click.stop="claim" />
</template>
