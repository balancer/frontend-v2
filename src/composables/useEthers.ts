import { ref } from 'vue';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/providers';

import useBlocknative from './useBlocknative';
import useTransactions from './useTransactions';
import useTokens from './useTokens';

type TxCallback = (
  txData: TransactionResponse,
  receipt?: TransactionReceipt
) => void;

// keep a record of processed txs
export const processedTxs = ref<Set<string>>(new Set(''));

export default function useEthers() {
  const { finalizeTransaction } = useTransactions();
  const { supportsBlocknative } = useBlocknative();
  const { refetchBalances } = useTokens();

  async function txListener(
    tx: TransactionResponse,
    callbacks: {
      onTxConfirmed: TxCallback;
      onTxFailed: TxCallback;
    },
    shouldRefetchBalances = true
  ) {
    processedTxs.value.add(tx.hash);

    try {
      const receipt = await tx.wait();
      // attempt to finalize transaction so that the pending tx watcher won't check the tx again.
      if (receipt != null) {
        finalizeTransaction(tx.hash, 'tx', receipt);
      }
      callbacks.onTxConfirmed(tx);
      if (shouldRefetchBalances && !supportsBlocknative.value) {
        refetchBalances.value();
      }
    } catch (error) {
      console.error(error);
      callbacks.onTxFailed(tx);
    }

    processedTxs.value.delete(tx.hash);
  }

  return { txListener };
}
