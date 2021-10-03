<script setup lang="ts">
import { computed, onMounted, toRef, ref } from 'vue';
import useTokenApprovals from '@/composables/pools/useTokenApprovals';
import { FullPool } from '@/services/balancer/subgraph/types';
import useTokens from '@/composables/useTokens';
import { Step } from '@/components/_global/BalHorizSteps/BalHorizSteps.vue';

/**
 * TYPES
 */
type Props = {
  pool: FullPool;
  fullAmounts: string[];
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

/**
 * STATE
 */
const steps = ref<Step[]>([]);

/**
 * COMPOSABLES
 */
const { getToken } = useTokens();
const { requiredAllowances } = useTokenApprovals(
  props.pool.tokenAddresses,
  toRef(props, 'fullAmounts')
);

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'invest',
    summary: t('transactionSummary.investInPool', [
      fiatTotalLabel.value,
      getPoolWeights(props.pool)
    ]),
    details: {
      total: fiatTotalLabel.value,
      pool: props.pool
    }
  });

  txListener(tx, {
    onTxConfirmed: (tx: TransactionResponse) => {
      emit('success', tx);
      state.amounts = [];
      state.submitting = false;
      showInvestPreview.value = false;
    },
    onTxFailed: () => {
      state.submitting = false;
    }
  });
}

async function submit(): Promise<void> {
  try {
    const tx = await poolExchange.join(
      getProvider(),
      account.value,
      fullAmounts.value,
      bptOut.value
    );

    console.log('Receipt', tx);

    handleTransaction(tx);
  } catch (error) {
    console.error(error);
  }
}

onMounted(() => {
  requiredAllowances.value.map((address, i) => {
    const token = getToken(address);
    steps.value.push({
      tooltip: `Approve ${token.symbol} to be invested on Balancer`,
      state: i === 0 ? 'active' : 'todo'
    });
  });
  steps.value.push({
    tooltip: 'Confirm investment into this pool',
    state: 'todo'
  });
});
</script>

<template>
  <BalHorizSteps :steps="steps" />
  <BalBtn
    color="gradient"
    class="mt-4"
    :disabled="submitting"
    :loading="submitting"
    :loading-label="$t('confirming')"
    block
    @click="emit('invest')"
  >
    {{ $t('invest') }}
  </BalBtn>
</template>
