import useWeb3 from '@/services/web3/useWeb3';
import { TransactionEventCode, TransactionData } from 'bnc-notify';
import castArray from 'lodash/castArray';
import mapValues from 'lodash/mapValues';

import useBlocknative from './useBlocknative';

type TxCallback = (txData: TransactionData) => void;

export default function useNotify() {
  const { explorerLinks } = useWeb3();
  const { notify, supportsBlocknative } = useBlocknative();

  function txListener(
    txHash: string | string[],
    callbacks?: {
      onTxConfirmed?: TxCallback;
      onTxCancel?: TxCallback;
      onTxFailed?: TxCallback;
    },
    strategy: 'all' | 'async' = 'all'
  ) {
    const txs = castArray(txHash);

    const eventsMap: Partial<Record<
      TransactionEventCode,
      TxCallback | undefined
    >> = {
      txConfirmed: callbacks?.onTxConfirmed,
      txCancel: callbacks?.onTxCancel,
      txFailed: callbacks?.onTxFailed
    };

    // init event counters
    const processedEventsCounter: Partial<Record<
      TransactionEventCode,
      number
    >> = mapValues(eventsMap, () => 0);

    txs.forEach(txHash => {
      const { emitter } = notify.hash(txHash);

      const defaultNotificationParams = {
        link: explorerLinks.txLink(txHash)
      };

      // apply notification defaults to all types
      emitter.on('all', () => {
        return defaultNotificationParams;
      });

      // register to events that have a callback
      Object.entries(eventsMap)
        .filter(([, txCallback]) => txCallback != null)
        .forEach(([eventName, txCallback]) => {
          emitter.on(
            eventName as TransactionEventCode,
            (txData: TransactionData) => {
              processedEventsCounter[eventName]++;

              // 'all' strategy will fire the callback after all txs were processed
              // 'async' strategy will fire the callback every time tx is processed
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

  return { txListener, supportsBlocknative };
}
