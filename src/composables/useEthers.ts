import { TransactionResponse } from '@ethersproject/providers';

type TxCallback = (txData: TransactionResponse) => void;

export default function useEthers() {
  async function txListener(
    tx: TransactionResponse,
    callbacks: {
      onTxConfirmed: TxCallback;
      onTxFailed: TxCallback;
    }
  ) {
    try {
      await tx.wait();
      callbacks.onTxConfirmed(tx);
    } catch (error) {
      console.error(error);
      callbacks.onTxFailed(tx);
    }
  }

  return { txListener };
}
