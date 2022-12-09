import { TransactionError } from '@/types/transactions';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { ref } from 'vue';

export enum State {
  IDLE = 'IDLE',
  TRANSACTION_INITIALIZED = 'INIT',
  CONFIRMING = 'CONFIRMING',
  CONFIRMED = 'CONFIRMED',
  ERROR = 'ERROR',
}

interface SuccessParams {
  confirmedAt: string;
  receipt: TransactionReceipt;
}

export default function useActionState() {
  const state = ref<State>(State.IDLE);
  const confirmedAt = ref<string>('');
  const receipt = ref<TransactionReceipt | null>(null);
  const error = ref<TransactionError | null>(null);

  function setInit() {
    state.value = State.TRANSACTION_INITIALIZED;
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
