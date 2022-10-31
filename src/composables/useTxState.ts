import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { computed, reactive } from 'vue';

export type TxState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  receipt?: TransactionReceipt;
};

/**
 * Composable for managing the state of a transaction.
 */
export function useTxState() {
  const txState = reactive<TxState>({
    init: false,
    confirming: false,
    confirmed: false,
    confirmedAt: '',
  });

  const txInProgress = computed(
    (): boolean => txState.init || txState.confirming || txState.confirmed
  );

  function resetTxState(): void {
    Object.assign(txState, {
      init: false,
      confirming: false,
      confirmed: false,
      confirmedAt: '',
    });
  }

  return { txState, txInProgress, resetTxState };
}
