import { useTxState } from './useTxState';

// Global transaction state to be used in gauge voting components
const { txState, resetTxState } = useTxState();

export function useVotingTransactionState() {
  return { txState, resetTxState };
}
