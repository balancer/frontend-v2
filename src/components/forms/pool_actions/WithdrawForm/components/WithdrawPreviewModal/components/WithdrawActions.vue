<script setup lang="ts">
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { formatUnits } from '@ethersproject/units';
import { ref, toRef, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import ConfirmationIndicator from '@/components/web3/ConfirmationIndicator.vue';
import useEthers from '@/composables/useEthers';
import { usePoolHelpers } from '@/composables/usePoolHelpers';
import { dateTimeLabelFor } from '@/composables/useTime';
import useNetwork from '@/composables/useNetwork';
import useTransactions from '@/composables/useTransactions';
import PoolExchange from '@/services/pool/exchange/exchange.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';
import useWithdrawalState from '../../../composables/useWithdrawalState';
import { WithdrawMathResponse } from '../../../composables/useWithdrawMath';
import router from '@/plugins/router';
import { Goals, trackGoal } from '@/composables/useFathom';
import { bnum } from '@/lib/utils';
import { useTokens } from '@/providers/tokens.provider';

/**
 * TYPES
 */
type Props = {
  pool: Pool;
  math: WithdrawMathResponse;
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
const { getSigner } = useWeb3();
const { addTransaction } = useTransactions();
const { txListener, getTxConfirmedAt } = useEthers();
const { poolWeightsLabel } = usePoolHelpers(toRef(props, 'pool'));
const {
  tokenOutIndex,
  tokensOut,
  tx: txState,
  resetTxState,
} = useWithdrawalState(toRef(props, 'pool'));
const { networkSlug } = useNetwork();
const { refetchBalances } = useTokens();

const {
  bptIn,
  fiatTotalLabel,
  fiatTotal,
  amountsOut,
  exactOut,
  singleAssetMaxOut,
} = toRefs(props.math);

const withdrawalAction: TransactionActionInfo = {
  label: t('withdraw.label'),
  loadingLabel: t('withdraw.preview.loadingLabel.withdraw'),
  confirmingLabel: t('confirming'),
  action: submit,
  stepTooltip: t('withdraw.preview.tooltips.withdrawStep'),
};

const actions = ref<TransactionActionInfo[]>([withdrawalAction]);

/**
 * SERVICES
 */
const poolExchange = new PoolExchange(toRef(props, 'pool'));

/**
 * METHODS
 */
async function handleTransaction(tx): Promise<void> {
  addTransaction({
    id: tx.hash,
    type: 'tx',
    action: 'withdraw',
    summary: t('transactionSummary.withdrawFromPool', [
      fiatTotalLabel.value,
      poolWeightsLabel(props.pool),
    ]),
    details: {
      total: fiatTotalLabel.value,
      pool: props.pool,
    },
  });

  txState.value.confirmed = await txListener(tx, {
    onTxConfirmed: async (receipt: TransactionReceipt) => {
      emit('success', receipt);
      txState.value.confirming = false;
      txState.value.receipt = receipt;

      const confirmedAt = await getTxConfirmedAt(receipt);
      txState.value.confirmedAt = dateTimeLabelFor(confirmedAt);
      trackGoal(
        Goals.Withdrawal,
        bnum(fiatTotal.value).times(100).toNumber() || 0
      );
      await refetchBalances();
    },
    onTxFailed: () => {
      txState.value.confirming = false;
    },
  });
}

async function submit(): Promise<TransactionResponse> {
  try {
    let tx;
    txState.value.init = true;

    tx = await poolExchange.exit(
      getSigner(),
      amountsOut.value,
      tokensOut.value,
      formatUnits(bptIn.value, props.pool?.onchain?.decimals || 18),
      singleAssetMaxOut.value ? tokenOutIndex.value : null,
      exactOut.value
    );

    txState.value.init = false;
    txState.value.confirming = true;

    console.log('Receipt', tx);

    handleTransaction(tx);
    return tx;
  } catch (error) {
    txState.value.init = false;
    txState.value.confirming = false;
    console.error(error);
    throw new Error('Failed to submit withdrawal transaction.', {
      cause: error,
    });
  }
}

function redirectToPool() {
  resetTxState();
  router.push({ name: 'pool', params: { networkSlug, id: props.pool.id } });
}
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
