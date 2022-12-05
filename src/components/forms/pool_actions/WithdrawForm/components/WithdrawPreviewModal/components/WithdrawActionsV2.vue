<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useEthers from '@/composables/useEthers';
import { usePool } from '@/composables/usePool';
import { dateTimeLabelFor } from '@/composables/useTime';
import useNetwork from '@/composables/useNetwork';
import useTransactions from '@/composables/useTransactions';
// Types
import { Pool } from '@/services/pool/types';
// Composables
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import router from '@/plugins/router';
import useExitPool from '@/composables/pools/useExitPool';
import useNumbers, { FNumFormats } from '@/composables/useNumbers';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  // math: WithdrawMathResponse;
};

/**
 * PROPS & EMITS
 */
const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'success', value: TransactionReceipt): void;
  (e: 'error'): void;
}>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { blockNumber } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { poolWeightsLabel } = usePool(toRef(props, 'pool'));
const { networkSlug } = useNetwork();
const { fNum2 } = useNumbers();

const {
  txState,
  txInProgress,
  exit,
  isLoadingQuery,
  queryExitQuery,
  fiatTotalOut,
  approvalActions: exitPoolApprovalActions,
} = useExitPool();

const withdrawalAction: TransactionActionInfo = {
  label: t('withdraw.label'),
  loadingLabel: t('withdraw.preview.loadingLabel.withdraw'),
  confirmingLabel: t('confirming'),
  action: submit,
  stepTooltip: t('withdraw.preview.tooltips.withdrawStep'),
};

const actions = ref<TransactionActionInfo[]>([
  ...exitPoolApprovalActions.value,
  withdrawalAction,
]);

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'withdraw',
    summary: t('transactionSummary.withdrawFromPool', [
      fNum2(fiatTotalOut.value, FNumFormats.fiat),
      poolWeightsLabel(props.pool),
    ]),
    details: {
      total: fNum2(fiatTotalOut.value, FNumFormats.fiat),
      pool: props.pool,
    },
  });

  txState.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      txState.confirming = false;
      txState.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      txState.confirmedAt = dateTimeLabelFor(confirmedAt);
    },
    onTxFailed: () => {
      txState.confirming = false;
    },
  });
}

async function submit(): Promise<TransactionResponse> {
  try {
    const tx = await exit();

    txState.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
    return tx;
  } catch (error) {
    txState.confirming = false;
    return Promise.reject(error);
  } finally {
    txState.init = false;
  }
  // try {
  //   let tx;
  //   txState.value.init = true;

  //   if (shouldUseBatchRelayer.value && batchRelayerSwap.value) {
  //     tx = await balancerContractsService.batchRelayer.execute(
  //       batchRelayerSwap.value,
  //       getProvider()
  //     );
  //   } else if (batchSwap.value) {
  //     tx = await boostedExitBatchSwap(
  //       batchSwap.value.swaps,
  //       batchSwap.value.assets,
  //       props.pool.address,
  //       bptIn.value,
  //       batchSwapAmountsOutMap.value,
  //       batchSwapKind.value
  //     );
  //   } else {
  //     tx = await poolExchange.exit(
  //       getProvider(),
  //       account.value,
  //       amountsOut.value,
  //       tokensOut.value,
  //       formatUnits(bptIn.value, props.pool?.onchain?.decimals || 18),
  //       singleAssetMaxOut.value ? tokenOutIndex.value : null,
  //       exactOut.value
  //     );
  //   }

  //   txState.value.init = false;
  //   txState.value.confirming = true;

  //   console.log('Receipt', tx);

  //   handleTransaction(tx);
  //   return tx;
  // } catch (error) {
  //   txState.value.init = false;
  //   txState.value.confirming = false;
  //   console.error(error);
  //   return Promise.reject(error);
  // }
}

function redirectToPool() {
  // resetTxState();
  router.push({ name: 'pool', params: { networkSlug, id: props.pool.id } });
}

/**
 * CALLBACKS
 */
// onBeforeMount(() => {
//   if (shouldUseBatchRelayer.value && !batchRelayerApproval.isUnlocked.value) {
//     // Prepend relayer approval action if batch relayer not approved
//     actions.value.unshift(batchRelayerApproval.action.value);
//   }
// });

/**
 * WATCHERS
 */
watch(blockNumber, () => {
  if (!isLoadingQuery.value && !txInProgress.value) {
    queryExitQuery.refetch.value();
  }
});
</script>


<template>
  <transition>
    <BalActionSteps
      v-if="!txState.confirmed || !txState.receipt"
      :actions="actions"
    />
    <div v-else>
      <ConfirmationIndicator :txReceipt="txState.receipt" />
      <BalBtn color="gray" outline block class="mt-2" @click="redirectToPool">
        {{ $t('returnToPool') }}
      </BalBtn>
    </div>
  </transition>
</template>
