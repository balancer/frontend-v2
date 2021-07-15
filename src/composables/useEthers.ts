import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/providers';
import useAccountBalances from './useAccountBalances';
import useBlocknative from './useBlocknative';
import useTransactions from './useTransactions';

type TxCallback = (
  txData: TransactionResponse,
  receipt?: TransactionReceipt
) => void;

export default function useEthers() {
  const { finalizeTransaction } = useTransactions();
  const { refetchBalances } = useAccountBalances();
  const { supportsBlocknative } = useBlocknative();

  async function txListener(
    tx: TransactionResponse,
    callbacks: {
      onTxConfirmed: TxCallback;
      onTxFailed: TxCallback;
    },
    shouldRefetchBalances = true
  ) {
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
  }

  return { txListener };
}
