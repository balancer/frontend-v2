<script lang="ts" setup>
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import useEthers from '@/composables/useEthers';
import useTransactions, {
  TransactionAction,
} from '@/composables/useTransactions';
import useWeb3 from '@/services/web3/useWeb3';

/**
 * TYPES
 */
type Props = {
  actionFn: () => Promise<TransactionResponse>;
  action: TransactionAction;
  summary: string;
  confirmingLabel: string;
  // eslint-disable-next-line vue/require-default-prop -- TODO: Define default prop
  onConfirmFn?: () => unknown;
  disabled?: boolean;
};

/**
 * PROPS & EMITS
 */
const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  (e: 'init'): void;
  (e: 'confirming', value: TransactionResponse): void;
  (e: 'confirmed', value: TransactionReceipt): void;
  (e: 'failed'): void;
}>();

/**
 * COMPOSABLES
 */
const { t } = useI18n();
const { addTransaction } = useTransactions();
const { txListener } = useEthers();
const { isMismatchedNetwork } = useWeb3();

/**
 * TYPES
 */
enum BtnStates {
  Default,
  Init,
  Confirming,
  Confirmed,
}

/**
 * STATE
 */
const btnState = ref(BtnStates.Default);

/**
 * COMPUTED
 */
const isWaitingOnWallet = computed(() => btnState.value === BtnStates.Init);
const isConfirming = computed(() => btnState.value === BtnStates.Confirming);

const loadingLabel = computed(() =>
  isWaitingOnWallet.value ? t('confirm') : props.confirmingLabel
);

/**
 * METHODS
 */
async function initTx() {
  try {
    btnState.value = BtnStates.Init;
    emit('init');

    const tx = await props.actionFn();

    btnState.value = BtnStates.Confirming;
    emit('confirming', tx);

    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: props.action,
      summary: props.summary,
    });

    await txListener(tx, {
      onTxConfirmed: async (receipt: TransactionReceipt) => {
        if (props.onConfirmFn) props.onConfirmFn();

        btnState.value = BtnStates.Confirmed;
        emit('confirmed', receipt);
      },
      onTxFailed: () => {
        console.error('Tx failed');
        btnState.value = BtnStates.Default;
        emit('failed');
      },
    });
  } catch (error) {
    btnState.value = BtnStates.Default;
    console.error(error);
  }
}
</script>

<template>
  <BalBtn
    :loadingLabel="loadingLabel"
    :loading="isWaitingOnWallet || isConfirming"
    :disabled="props.disabled || isMismatchedNetwork"
    @click.stop="initTx"
  />
</template>
