import { TransactionError } from '@/types/transactions';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { ref } from 'vue';

export enum State {
  IDLE = 'IDLE',
  TRANSACTIONINITIALIZED = 'INIT',
  CONFIRMING = 'CONFIRMING',
  CONFIRMED = 'CONFIRMED',
  ERROR = 'ERROR',
}

interface SuccessParams {
  confirmedAt: string;
  receipt: TransactionReceipt;
}

export function useActionsState() {
  const state = ref<State>(State.IDLE);
  const confirmedAt = ref<string>('');
  const receipt = ref<TransactionReceipt | null>(null);
  const error = ref<TransactionError | null>(null);

  function setInit() {
    state.value = State.TRANSACTIONINITIALIZED;
    error.value = null;
  }

  function setConfirming() {
    state.value = State.CONFIRMING;
  }
  function setSuccess(successParams: SuccessParams) {
    state.value = State.CONFIRMED;
    receipt.value = successParams.receipt;
    confirmedAt.value = successParams.confirmedAt;
  }
  function setError({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) {
    state.value = State.ERROR;
    error.value = {
      title,
      description,
    };
  }

  return {
    state,
    confirmedAt,
    receipt,
    error,
    setInit,
    setConfirming,
    setSuccess,
    setError,
  };
}
