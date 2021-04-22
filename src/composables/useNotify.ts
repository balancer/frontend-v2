import { TransactionEventCode, TransactionData } from 'bnc-notify';
import castArray from 'lodash/castArray';
import mapValues from 'lodash/mapValues';

import useBlocknative from './useBlocknative';
import useWeb3 from './useWeb3';

type TxCallback = (txData: TransactionData) => void;

export default function useNotify() {
  const { notify } = useBlocknative();
  const { explorer } = useWeb3();

  function txListener(
    txHash: string | string[],
    {
      onTxConfirmed,
      onTxCancel,
      onTxFailed
    }: {
      onTxConfirmed?: TxCallback;
      onTxCancel?: TxCallback;
      onTxFailed?: TxCallback;
    },
    strategy: 'all' | 'race' = 'all'
  ) {
    const txs = castArray(txHash);

    txs.forEach(txHash => {
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

      // init event counters
      const processedEventsCounter: Partial<Record<
        TransactionEventCode,
        number
      >> = mapValues(eventsMap, () => 0);

      // register to events that have a callback
      Object.entries(eventsMap)
        .filter(([, txCallback]) => txCallback != null)
        .forEach(([eventName, txCallback]) => {
          emitter.on(
            eventName as TransactionEventCode,
            (txData: TransactionData) => {
              processedEventsCounter[eventName]++;

              // 'all' strategy will fire the callback after all txs were processed
              // 'race' strategy will fire the callback every time tx is processed
              if (
                txCallback != null &&
                (strategy === 'all'
                  ? processedEventsCounter[eventName] === txs.length
                  : true)
              ) {
                txCallback(txData);
              }

              return defaultNotificationParams;
            }
          );
        });
    });
  }

  return { txListener };
}
