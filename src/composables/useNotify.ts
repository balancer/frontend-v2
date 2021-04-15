import { TransactionEventCode, TransactionData } from 'bnc-notify';

import useBlocknative from './useBlocknative';
import useWeb3 from './useWeb3';

type TxCallback = (txData: TransactionData) => void;

export default function useNotify() {
  const { notify } = useBlocknative();
  const { explorer } = useWeb3();

  function txListener(
    txHash: string,
    {
      onTxConfirmed,
      onTxCancel,
      onTxFailed
    }: {
      onTxConfirmed?: TxCallback;
      onTxCancel?: TxCallback;
      onTxFailed?: TxCallback;
    }
  ) {
    const { emitter } = notify.hash(txHash);

    const defaultNotificationParams = {
      link: explorer.txLink(txHash)
    };

    // apply notification defaults to all types
    emitter.on('all', () => {
      return defaultNotificationParams;
    });

    const eventsMap: Partial<Record<
      TransactionEventCode,
      TxCallback | undefined
    >> = {
      txConfirmed: onTxConfirmed,
      txCancel: onTxCancel,
      txFailed: onTxFailed
    };

    // register to events that have a callback
    Object.entries(eventsMap)
      .filter(([, txCallback]) => txCallback != null)
      .forEach(([eventName, txCallback]) => {
        emitter.on(
          eventName as TransactionEventCode,
          (txData: TransactionData) => {
            if (txCallback != null) {
              txCallback(txData);
            }

            return defaultNotificationParams;
          }
        );
      });
  }

  return { txListener };
}
