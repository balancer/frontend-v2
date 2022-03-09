<script lang="ts" setup>
import { computed } from 'vue';
import { balancerMinter } from '@/services/balancer/contracts/contracts/balancer-minter';
import { Gauge } from '@/services/balancer/gauges/types';
import { getAddress } from '@ethersproject/address';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/abstract-provider';
import useTransactions from '@/composables/useTransactions';
import useEthers from '@/composables/useEthers';

/**
 * TYPES
 */
type Props = {
  gauges: Gauge[];
  label: string;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * COMPOSABLES
 */
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();

/**
 * COMPUTED
 */
const gaugeAddresses = computed((): string[] =>
  props.gauges.map(gauge => getAddress(gauge.id))
);

/**
 * METHODS
 */
// async function claimTx(): Promise<TransactionResponse> {
//   if (props.gauges.length === 1) {
//     return await balancerMinter.mint(gaugeAddresses.value[0]);
//   } else {
//     return await balancerMinter.mintMany(gaugeAddresses.value);
//   }
// }

// async function handleTransaction(tx: TransactionResponse) {
//   addTransaction({
//     id: tx.hash,
//     type: 'tx',
//     action: 'claim',
//     summary: 'Claim BAL',
//     details: {
//       total: fiatTotalLabel.value
//     }
//   });

//   await txListener(tx, {
//     onTxConfirmed: async (receipt: TransactionReceipt) => {
//       investmentState.receipt = receipt;

//       const confirmedAt = await getTxConfirmedAt(receipt);
//       investmentState.confirmedAt = dateTimeLabelFor(confirmedAt);
//       investmentState.confirmed = true;
//       investmentState.confirming = false;
//     },
//     onTxFailed: () => {
//       console.error('Invest failed');
//       investmentState.confirming = false;
//     }
//   });
// }

async function claim() {
  // const tx = await claimTx();
  // handleTransaction(tx);
}
</script>

<template>
  <BalBtn :label="label" color="gradient" size="sm" @click.stop="claim" />
</template>
