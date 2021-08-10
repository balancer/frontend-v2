import { ref } from 'vue';
import {
  TransactionReceipt,
  TransactionResponse
} from '@ethersproject/providers';
import {
  retryPromiseWithDelay,
  tryPromiseWithTimeout
} from '@/lib/utils/promise';

import useBlocknative from './useBlocknative';
import useTransactions from './useTransactions';
import useTokens from './useTokens';
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';

type TxCallback = (
  txData: TransactionResponse,
  receipt?: TransactionReceipt
) => void;

// keep a record of processed txs
export const processedTxs = ref<Set<string>>(new Set(''));

export default function useEthers() {
  const { finalizeTransaction, updateTransaction } = useTransactions();
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
      // Sometimes this will throw if we're talking to a service
      // in front of the RPC that hasn't picked up the tx yet (e.g. Gnosis)
      const receipt = await retryPromiseWithDelay(tx.wait(), 5, 5000);

      let txHash = tx.hash;
      try {
        // If we're using a Gnosis safe then the transaction we were tracking is really a "SafeTx"
        // We need to query the backend to get the actual transaction hash for the block explorer link
        const realTx = await tryPromiseWithTimeout(
          new SafeAppsSDK().txs.getBySafeTxHash(tx.hash),
          1000
        );
        if (realTx.txHash !== null) {
          txHash = realTx.txHash;
          updateTransaction(tx.hash, 'tx', {
            id: realTx.txHash
          });
        }
      } catch {
        // eslint-disable-next-line no-empty
      }

      // Attempt to finalize transaction so that the pending tx watcher won't check the tx again.
      if (receipt != null) {
        finalizeTransaction(txHash, 'tx', receipt);
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
