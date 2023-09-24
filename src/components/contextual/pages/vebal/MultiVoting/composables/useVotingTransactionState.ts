import { useTxState } from '@/composables/useTxState';

// Global transaction state to be used by gauge voting components
const { txState, resetTxState } = useTxState();

export function useVotingTransactionState() {
  return { txState, resetTxState };
}
