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

const waitForTxConfirmation = async (
  tx: TransactionResponse
): Promise<TransactionReceipt> => {
  try {
    // Sometimes this will throw if we're talking to a service
    // in front of the RPC that hasn't picked up the tx yet (e.g. Gnosis)
    return await tx.wait();
  } catch {
    // If so then give it a couple of seconds to catch up and try again
    await new Promise(r => setTimeout(r, 5000));
    return tx.wait();
  }
};

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
      const receipt = await waitForTxConfirmation(tx);
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
