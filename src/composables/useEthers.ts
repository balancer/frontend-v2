import { APP } from '@/constants/app';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/providers';
import useAccountBalances from './useAccountBalances';
import useTransactions from './useTransactions';

type TxCallback = (
  txData: TransactionResponse,
  receipt?: TransactionReceipt
) => void;

export default function useEthers() {
  const { finalizeTransaction } = useTransactions();
  const { refetchBalances } = useAccountBalances();

  async function txListener(
    tx: TransactionResponse,
    callbacks: {
      onTxConfirmed: TxCallback;
      onTxFailed: TxCallback;
    },
    shouldRefetchBalances = false
  ) {
    try {
      const receipt = await tx.wait();
      // attempt to finalize transaction so that the pending tx watcher won't check the tx again.
      if (APP.IsGnosisIntegration && receipt != null) {
        finalizeTransaction(tx.hash, 'tx', receipt);
      }
      callbacks.onTxConfirmed(tx);
      if (shouldRefetchBalances) {
        refetchBalances.value();
      }
    } catch (error) {
      console.error(error);
      callbacks.onTxFailed(tx);
    }
  }

  return { txListener };
}
