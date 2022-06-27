<script lang="ts" setup>
import { computed } from 'vue';

import { faucet } from '@/services/balancer/contracts/contracts/faucet';

import TxActionBtn from '../TxActionBtn/TxActionBtn.vue';

/**
 * TYPES
 */
type Props = {
  token: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const tokenAddress = computed((): string => props.token);

/**
 * METHODS
 */
async function dripTx() {
  return await faucet.drip(tokenAddress.value);
}
</script>

<template>
  <TxActionBtn
    label="Drip"
    color="gradient"
    size="sm"
    :actionFn="dripTx"
    action="drip"
    summary="Dripping from faucet"
    confirmingLabel="Drip"
  />
</template>
