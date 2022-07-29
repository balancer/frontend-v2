import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';
import { ref } from 'vue';

import {
  retryPromiseWithDelay,
  tryPromiseWithTimeout,
} from '@/lib/utils/promise';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

import useBlocknative from './useBlocknative';
import { toJsTimestamp } from './useTime';
import useTokens from './useTokens';
import useTransactions from './useTransactions';

type ConfirmedTxCallback = (receipt: TransactionReceipt) => void;
type FailedTxCallback = (txData: TransactionResponse) => void;

// keep a record of processed txs
export const processedTxs = ref<Set<string>>(new Set(''));

export default function useEthers() {
  const { finalizeTransaction, updateTransaction } = useTransactions();
  const { supportsBlocknative } = useBlocknative();
  const { refetchBalances } = useTokens();

  async function getTxConfirmedAt(receipt: TransactionReceipt): Promise<Date> {
    const block = await rpcProviderService.jsonProvider.getBlock(
      receipt.blockNumber
    );

    return new Date(toJsTimestamp(block.timestamp));
  }

  async function isTxConfirmed(hash: string): Promise<boolean> {
    const tx = await rpcProviderService.jsonProvider.getTransaction(hash);
    const isConfirmed = new Promise<boolean>(resolve => {
      txListener(
        tx,
        {
          onTxConfirmed: () => {
            resolve(true);
          },
          onTxFailed: () => {
            resolve(false);
          },
        },
        false,
        false
      );
    });

    return isConfirmed;
  }

  async function txListener(
    tx: TransactionResponse,
    callbacks: {
      onTxConfirmed: ConfirmedTxCallback;
      onTxFailed: FailedTxCallback;
    },
    shouldRefetchBalances = true,
    shouldRetry = true
  ): Promise<boolean> {
    console.log('tx', tx);
    let confirmed = false;
    const retries = shouldRetry ? 5 : 1;
    processedTxs.value.add(tx.hash);

    try {
      // Sometimes this will throw if we're talking to a service
      // in front of the RPC that hasn't picked up the tx yet (e.g. Gnosis)
      const receipt = await retryPromiseWithDelay(tx.wait(), retries, 5000);

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
            id: realTx.txHash,
          });
        }
      } catch {
        // eslint-disable-next-line no-empty
      }

      // Attempt to finalize transaction so that the pending tx watcher won't check the tx again.
      if (receipt != null) {
        finalizeTransaction(txHash, 'tx', receipt);
      }
      callbacks.onTxConfirmed(receipt);
      if (shouldRefetchBalances && !supportsBlocknative.value) {
        refetchBalances.value();
      }
      confirmed = true;
    } catch (error) {
      console.error(error);
      callbacks.onTxFailed(tx);
    }

    processedTxs.value.delete(tx.hash);

    return confirmed;
  }

  return { txListener, getTxConfirmedAt, isTxConfirmed };
}
