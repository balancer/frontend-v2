import { computed, ref } from 'vue';
import { merge, orderBy } from 'lodash';
import { TransactionReceipt } from '@ethersproject/providers';
import { useI18n } from 'vue-i18n';

import LS_KEYS from '@/constants/local-storage.keys';

import { configService } from '@/services/config/config.service';
import { gnosisOperator } from '@/services/gnosis/operator.service';
import useWeb3 from '@/services/web3/useWeb3';
import { OrderMetaData } from '@/services/gnosis/types';
import { gnosisExplorer } from '@/services/gnosis/explorer.service';

import { lsGet, lsSet } from '@/lib/utils';

import useNotifications from './useNotifications';
import useAccountBalances from './useAccountBalances';

const DAY_MS = 86_400_000;

export type TransactionStatus =
  | 'pending'
  | 'confirmed'
  | 'expired'
  | 'cancelling'
  | 'cancelled';

export type TransactionAction =
  | 'claim'
  | 'approve'
  | 'trade'
  | 'invest'
  | 'withdraw';

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

export type Transaction = {
  id: string;
  action: TransactionAction;
  type: TransactionType;
  receipt?: OrderMetaData | TxReceipt;
  details?: Record<string, any>;
  summary: string;
  addedTime: number;
  confirmedTime?: number;
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

const PERSIST_TRANSACTIONS = false;

// TODO: What happens if the structure changes? Either keep a version or schema validator.
export const transactionsState = ref<TransactionState>(
  PERSIST_TRANSACTIONS ? lsGet<TransactionState>(LS_KEYS.Transactions, {}) : {}
);

// COMPUTED
const transactions = computed(() =>
  orderBy(Object.values(getTransactions()), 'addedTime', 'desc').filter(
    isTransactionRecent
  )
);

const pendingTransactions = computed(() =>
  transactions.value.filter(({ status }) => status === 'pending')
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
    transactionIndex: receipt.transactionIndex
  };
}

function isTransactionRecent(transaction: Transaction): boolean {
  return Date.now() - transaction.addedTime < DAY_MS;
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

  if (PERSIST_TRANSACTIONS) {
    lsSet(LS_KEYS.Transactions, transactionsState.value);
  }
}

function getTransaction(id: string, type: TransactionType) {
  const transactionsMap = getTransactions();
  const txId = getId(id, type);

  return transactionsMap[txId];
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
    transactionsMap[txId] = merge(transaction, updates);

    setTransactions(transactionsMap);

    return true;
  }

  return false;
}

// Adapted from Uniswap code
function shouldCheckTx(transaction: Transaction, lastBlockNumber: number) {
  if (transaction.status === 'confirmed') {
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
    blockNumber
  } = useWeb3();
  const { addNotification } = useNotifications();
  const { refetchBalances } = useAccountBalances();
  const { t } = useI18n();

  // COMPUTED
  const provider = computed(() => getWeb3Provider());

  // METHODS
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
      status: 'pending'
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
      const updateSuccessful = updateTransaction(id, type, {
        receipt:
          type === 'tx'
            ? normalizeTxReceipt(receipt as TransactionReceipt)
            : receipt,
        status: 'confirmed',
        confirmedTime: Date.now()
      });
      if (updateSuccessful) {
        addNotificationForTransaction(id, type);
        return true;
      }
    }

    return false;
  }

  function addNotificationForTransaction(id: string, type: TransactionType) {
    const transaction = getTransaction(id, type);

    addNotification({
      title: `${t(`recentActivityStatus.${transaction.status}`)} ${
        transaction.action
      }`,
      transactionMetadata: {
        id: transaction.id,
        status: transaction.status,
        explorerLink: getExplorerLink(transaction.id, transaction.type)
      },
      message: transaction.summary
    });
  }

  async function handlePendingTransactions() {
    let shouldRefetchBalances = false;

    if (pendingOrderActivity.value.length) {
      const orders = await Promise.all(
        pendingOrderActivity.value.map(transaction =>
          gnosisOperator.getOrder(transaction.id)
        )
      );

      orders.forEach((order, orderIndex) => {
        // TODO: Once Gnosis mainnet supports "fulfilled" status - switch to it instead of amount checking.
        if (
          order != null &&
          Number(order.executedBuyAmount) > 0 &&
          Number(order.executedSellAmount) > 0
        ) {
          finalizeTransaction(order.uid, 'order', order);
          shouldRefetchBalances = true;
        } else {
          updateTransaction(
            pendingOrderActivity.value[orderIndex].id,
            'order',
            {
              lastCheckedBlockNumber: blockNumber.value
            }
          );
        }
      });
    }

    if (pendingTxActivity.value.length) {
      const txs = await Promise.all(
        pendingTxActivity.value
          .filter(transaction => shouldCheckTx(transaction, blockNumber.value))
          .map(transaction =>
            provider.value.getTransactionReceipt(transaction.id)
          )
      );

      txs.forEach((tx, txIndex) => {
        if (tx != null) {
          finalizeTransaction(tx.transactionHash, 'tx', tx);
          shouldRefetchBalances = true;
        } else {
          updateTransaction(pendingTxActivity.value[txIndex].id, 'tx', {
            lastCheckedBlockNumber: blockNumber.value
          });
        }
      });

      if (shouldRefetchBalances) {
        refetchBalances.value();
      }
    }
  }

  function getExplorerLink(id: string, type: TransactionType) {
    if (type === 'tx') {
      return explorerLinks.txLink(id);
    }
    return gnosisExplorer.orderLink(id);
  }

  return {
    // methods
    getTransactions,
    addTransaction,
    clearAllTransactions,
    handlePendingTransactions,
    finalizeTransaction,
    getExplorerLink,

    // computed
    pendingTransactions,
    transactions
  };
}
