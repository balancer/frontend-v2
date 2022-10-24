import { TransactionReceipt } from '@ethersproject/providers';
import { formatUnits } from '@ethersproject/units';
import { merge, orderBy } from 'lodash';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import LS_KEYS from '@/constants/local-storage.keys';
import { lsGet, lsSet } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { gnosisExplorer } from '@/services/gnosis/explorer.service';
import { gnosisProtocolService } from '@/services/gnosis/gnosisProtocol.service';
import { OrderMetaData } from '@/services/gnosis/types';
import useWeb3 from '@/services/web3/useWeb3';

import { GnosisTransactionDetails } from './trade/useGnosis';
import { processedTxs } from './useEthers';
import useNotifications from './useNotifications';
import useNumbers, { FNumFormats } from './useNumbers';

const WEEK_MS = 86_400_000 * 7;
// Please update the schema version when making changes to the transaction structure.
const TRANSACTIONS_SCHEMA_VERSION = '1.1.3';

export type TransactionStatus =
  | 'pending'
  | 'fulfilled'
  | 'expired'
  | 'cancelling'
  | 'cancelled'
  | 'failed';

export type TransactionAction =
  | 'drip'
  | 'claim'
  | 'approve'
  | 'trade'
  | 'wrap'
  | 'unwrap'
  | 'invest'
  | 'withdraw'
  | 'createPool'
  | 'fundPool'
  | 'migratePool'
  | 'createLock'
  | 'extendLock'
  | 'increaseLock'
  | 'unlock'
  | 'voteForGauge'
  | 'unstake'
  | 'stake'
  | 'restake';

export type TransactionType = 'order' | 'tx';

export type TxReceipt = Pick<
  TransactionReceipt,
  | 'blockHash'
  | 'blockNumber'
  | 'contractAddress'
  | 'from'
  | 'status'
  | 'to'
  | 'transactionHash'
  | 'transactionIndex'
>;

export type OrderReceipt = OrderMetaData;

export type ReplacementReason = 'txSpeedUp' | 'txCancel';

export type Transaction = {
  id: string;
  originalId?: string;
  replacementReason?: ReplacementReason;
  action: TransactionAction;
  type: TransactionType;
  receipt?: OrderReceipt | TxReceipt;
  details?: Record<string, any>;
  summary: string;
  addedTime: number;
  finalizedTime?: number;
  from: string;
  lastCheckedBlockNumber?: number;
  status: TransactionStatus;
};

export type NewTransaction = Pick<
  Transaction,
  'id' | 'type' | 'summary' | 'receipt' | 'action' | 'details'
>;

const networkId = configService.network.chainId;

export type TransactionsMap = Record<string, Transaction>;

export type TransactionState = {
  [networkId: number]: TransactionsMap;
};

// TODO: What happens if the structure changes? Either keep a version or schema validator.
export const transactionsState = ref<TransactionState>(
  lsGet<TransactionState>(LS_KEYS.Transactions, {}, TRANSACTIONS_SCHEMA_VERSION)
);

// COMPUTED
const transactions = computed(() =>
  orderBy(Object.values(getTransactions()), 'addedTime', 'desc').filter(
    isTransactionRecent
  )
);

const pendingTransactions = computed(() =>
  transactions.value.filter(transaction =>
    isPendingTransactionStatus(transaction.status)
  )
);

const finalizedTransactions = computed(() =>
  transactions.value.filter(transaction =>
    isFinalizedTransactionStatus(transaction.status)
  )
);

const pendingOrderActivity = computed(() =>
  pendingTransactions.value.filter(({ type }) => type === 'order')
);

const pendingTxActivity = computed(() =>
  pendingTransactions.value.filter(({ type }) => type === 'tx')
);

// METHODS
function normalizeTxReceipt(receipt: TransactionReceipt) {
  return {
    blockHash: receipt.blockHash,
    blockNumber: receipt.blockNumber,
    contractAddress: receipt.contractAddress,
    from: receipt.from,
    status: receipt.status,
    to: receipt.to,
    transactionHash: receipt.transactionHash,
    transactionIndex: receipt.transactionIndex,
  };
}

function isTransactionRecent(transaction: Transaction): boolean {
  return Date.now() - transaction.addedTime < WEEK_MS;
}

function clearAllTransactions() {
  setTransactions({});
}

function getId(id: string, type: TransactionType) {
  return `${type}_${id}`;
}

function getTransactions(): TransactionsMap {
  const transactionsMap = transactionsState.value[networkId] ?? {};

  return transactionsMap;
}

function setTransactions(transactionsMap: TransactionsMap) {
  transactionsState.value[networkId] = transactionsMap;

  lsSet(
    LS_KEYS.Transactions,
    transactionsState.value,
    TRANSACTIONS_SCHEMA_VERSION
  );
}

function getTransaction(id: string, type: TransactionType) {
  const transactionsMap = getTransactions();
  const txId = getId(id, type);

  return transactionsMap[txId] ?? null;
}

function updateTransaction(
  id: string,
  type: TransactionType,
  updates: Partial<Transaction>
) {
  const transactionsMap = getTransactions();
  const txId = getId(id, type);
  const transaction = transactionsMap[txId];

  if (transaction != null) {
    // id change requires a replacement of the transaction
    if (updates.id != null) {
      const newTxId = getId(updates.id, type);

      transactionsMap[newTxId] = merge({}, transaction, updates, {
        originalId: id,
      });
      delete transactionsMap[txId];
    } else {
      transactionsMap[txId] = merge({}, transaction, updates);
    }

    setTransactions(transactionsMap);

    return true;
  }

  return false;
}

function isSuccessfulTransaction(transaction: Transaction) {
  return transaction.status === 'fulfilled';
}

function isPendingTransactionStatus(status: TransactionStatus) {
  return !isFinalizedTransactionStatus(status);
}

function isFinalizedTransactionStatus(status: TransactionStatus) {
  return ['fulfilled', 'cancelled', 'failed', 'expired'].includes(status);
}

// Adapted from Uniswap code
function shouldCheckTx(transaction: Transaction, lastBlockNumber: number) {
  if (
    processedTxs.value.has(transaction.id) ||
    isFinalizedTransactionStatus(transaction.status)
  ) {
    return false;
  }

  if (!transaction.lastCheckedBlockNumber) {
    return true;
  }

  const blocksSinceCheck = lastBlockNumber - transaction.lastCheckedBlockNumber;
  if (blocksSinceCheck < 1) {
    return false;
  }

  const minutesPending = (Date.now() - transaction.addedTime) / 1000 / 60;
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9;
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2;
  } else {
    // otherwise every block
    return true;
  }
}

export default function useTransactions() {
  // COMPOSABLES
  const {
    account,
    explorerLinks,
    getProvider: getWeb3Provider,
    blockNumber,
  } = useWeb3();
  const { addNotification } = useNotifications();
  const { t } = useI18n();
  const { fNum2 } = useNumbers();

  // COMPUTED
  const provider = computed(() => getWeb3Provider());

  // METHODS
  function getSettledOrderSummary(
    transaction: Transaction,
    receipt: OrderReceipt
  ) {
    const details = transaction.details as GnosisTransactionDetails;

    if (details != null) {
      const { tokenIn, tokenOut } = details;

      const tokenInAmount = formatUnits(
        receipt.executedSellAmount,
        tokenIn.decimals
      );

      const tokenOutAmount = formatUnits(
        receipt.executedBuyAmount,
        tokenOut.decimals
      );

      return `${fNum2(tokenInAmount, FNumFormats.token)} ${
        tokenIn.symbol
      } -> ${fNum2(tokenOutAmount, FNumFormats.token)} ${tokenOut.symbol}`;
    }

    return transaction.summary;
  }

  function addTransaction(newTransaction: NewTransaction) {
    const transactionsMap = getTransactions();
    const txId = getId(newTransaction.id, newTransaction.type);

    if (transactionsMap[txId]) {
      throw new Error(`The transaction ${newTransaction.id} already exists.`);
    }

    transactionsMap[txId] = {
      ...newTransaction,
      from: account.value,
      addedTime: Date.now(),
      status: 'pending',
    };

    setTransactions(transactionsMap);
    addNotificationForTransaction(newTransaction.id, newTransaction.type);
  }

  function finalizeTransaction(
    id: string,
    type: TransactionType,
    receipt: Transaction['receipt']
  ) {
    if (receipt != null) {
      const transaction = getTransaction(id, type);

      if (transaction != null) {
        const updates: Partial<Transaction> = {
          finalizedTime: Date.now(),
        };

        if (type === 'tx') {
          const txReceipt = receipt as TransactionReceipt;

          updates.receipt = normalizeTxReceipt(txReceipt);
          if (transaction.replacementReason === 'txCancel') {
            updates.status = 'cancelled';
          } else {
            updates.status = txReceipt?.status === 1 ? 'fulfilled' : 'failed';
          }
        } else {
          const orderReceipt = receipt as OrderReceipt;

          updates.receipt = orderReceipt;
          updates.status = orderReceipt.status;
          if (orderReceipt.status === 'fulfilled') {
            updates.summary = getSettledOrderSummary(transaction, orderReceipt);
          }
        }

        const updateSuccessful = updateTransaction(id, type, updates);

        if (updateSuccessful) {
          addNotificationForTransaction(id, type);
          return true;
        }
      }
    }

    return false;
  }

  function addNotificationForTransaction(id: string, type: TransactionType) {
    const transaction = getTransaction(id, type);

    if (transaction != null) {
      addNotification({
        type: isFinalizedTransactionStatus(transaction.status)
          ? isSuccessfulTransaction(transaction)
            ? 'success'
            : 'error'
          : 'info',
        title: `${t(`transactionAction.${transaction.action}`)} ${t(
          `transactionStatus.${transaction.status}`
        )}`,
        message: transaction.summary,
        transactionMetadata: {
          id: transaction.id,
          status: transaction.status,
          explorerLink: getExplorerLink(transaction.id, transaction.type),
        },
      });
    }
  }

  function checkOrderActivity(transaction: Transaction) {
    gnosisProtocolService
      .getOrder(transaction.id)
      .then(order => {
        console.log(order);
        if (order != null && isFinalizedTransactionStatus(order.status)) {
          finalizeTransaction(transaction.id, 'order', order);
        }
      })
      .catch(e =>
        console.log(
          '[Transactions]: Failed to fetch order information',
          transaction,
          e
        )
      )
      .finally(() => {
        updateTransaction(transaction.id, 'order', {
          lastCheckedBlockNumber: blockNumber.value,
        });
      });
  }

  function checkTxActivity(transaction: Transaction) {
    if (provider.value != null) {
      provider.value
        .getTransactionReceipt(transaction.id)
        .then(tx => {
          if (tx != null) {
            finalizeTransaction(transaction.id, 'tx', tx);
          }
        })
        .catch(e =>
          console.log(
            '[Transactions]: Failed to fetch tx information',
            transaction,
            e
          )
        )
        .finally(() =>
          updateTransaction(transaction.id, 'tx', {
            lastCheckedBlockNumber: blockNumber.value,
          })
        );
    }
  }

  async function handlePendingTransactions() {
    pendingOrderActivity.value.forEach(checkOrderActivity);

    pendingTxActivity.value
      .filter(transaction => shouldCheckTx(transaction, blockNumber.value))
      .forEach(checkTxActivity);
  }

  function getExplorerLink(id: string, type: TransactionType) {
    if (type === 'tx') {
      return explorerLinks.txLink(id);
    }
    return gnosisExplorer.orderLink(id);
  }

  return {
    // methods
    getTransaction,
    getTransactions,
    addTransaction,
    clearAllTransactions,
    handlePendingTransactions,
    finalizeTransaction,
    getExplorerLink,
    isSuccessfulTransaction,
    isPendingTransactionStatus,
    updateTransaction,

    // computed
    pendingTransactions,
    finalizedTransactions,
    transactions,
  };
}
