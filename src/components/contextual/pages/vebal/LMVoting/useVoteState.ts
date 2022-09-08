import { TransactionActionState } from '@/types/transactions';
import { TransactionReceipt } from '@ethersproject/abstract-provider';
import { reactive, toRefs } from 'vue';

export default function useVoteState() {
  const state = reactive<TransactionActionState>({
    init: false,
    confirming: false,
    confirmed: false,
    confirmedAt: '',
    receipt: undefined,
    error: null,
  });

  function init() {
    state.init = true;
    state.error = null;
  }

  function confirm() {
    state.init = false;
    state.confirming = true;
  }

  function error({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) {
    state.init = false;
    state.confirming = false;
    state.error = {
      title,
      description,
    };
  }

  function success({
    confirmedAt,
    receipt,
  }: {
    confirmedAt: string;
    receipt: TransactionReceipt;
  }) {
    state.receipt = receipt;
    state.confirmedAt = confirmedAt;
    state.confirmed = true;
    state.confirming = false;
  }

  return {
    state,
    actions: {
      init,
      confirm,
      error,
      success,
    },
  };
}
