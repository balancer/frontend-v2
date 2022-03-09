<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { balancerMinter } from '@/services/balancer/contracts/contracts/balancer-minter';
import { Gauge } from '@/services/balancer/gauges/types';
import { getAddress } from '@ethersproject/address';
import useTransactions from '@/composables/useTransactions';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';
import useEthers from '@/composables/useEthers';
import useGaugesQuery from '@/composables/queries/useGaugesQuery';
import useGaugesDecorationQuery from '@/composables/queries/useGaugesDecorationQuery';

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
const { txListener } = useEthers();
const { data: subgraphGauges } = useGaugesQuery();
const gaugesQuery = useGaugesDecorationQuery(subgraphGauges);

/**
 * STATE
 */
const state = reactive({
  confirming: false
});

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
  state.confirming = true;

  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'claim',
    summary: `Claim ${fNum2(props.amount, FNumFormats.token)} BAL`
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
    :label="label"
    loadingLabel="Claiming..."
    color="gradient"
    size="sm"
    :loading="state.confirming"
    :disabled="state.confirming"
    @click.stop="claim"
  />
</template>
