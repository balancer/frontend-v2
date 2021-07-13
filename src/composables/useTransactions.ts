import { computed, ref } from 'vue';
import { merge, orderBy } from 'lodash';
import { TransactionReceipt } from '@ethersproject/providers';
import { useI18n } from 'vue-i18n';

import { configService } from '@/services/config/config.service';
import { gnosisOperator } from '@/services/gnosis/operator.service';
import useVueWeb3 from '@/services/web3/useVueWeb3';
import { OrderMetaData } from '@/services/gnosis/types';
import { gnosisExplorer } from '@/services/gnosis/explorer.service';

import { lsGet, lsSet } from '@/lib/utils';

import LS_KEYS from '@/constants/local-storage.keys';
import useNotifications from './useNotifications';

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
  summary: string;
  addedTime: number;
  confirmedTime?: number;
  from: string;
  lastCheckedBlockNumber?: number;
  status: TransactionStatus;
};

export type NewTransaction = Pick<
  Transaction,
  'id' | 'type' | 'summary' | 'receipt' | 'action'
>;

const networkId = Number(configService.env.NETWORK);

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

export default function useTransactions() {
  // COMPOSABLES
  const { account, explorerLinks } = useVueWeb3();
  const { getProvider: getWeb3Provider } = useVueWeb3();
  const { addNotification } = useNotifications();
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
    addNotificationForTransaction(transactionsMap[txId]);
  }

  function finalizeTransaction(
    id: string,
    type: TransactionType,
    receipt: Transaction['receipt']
  ) {
    const transactionsMap = getTransactions();
    const txId = getId(id, type);
    const transaction = transactionsMap[txId];

    if (transaction != null && receipt != null) {
      transactionsMap[txId] = merge(transaction, {
        receipt:
          type === 'tx'
            ? normalizeTxReceipt(receipt as TransactionReceipt)
            : receipt,
        status: 'confirmed',
        confirmedTime: Date.now()
      });

      setTransactions(transactionsMap);
      addNotificationForTransaction(transactionsMap[txId]);
    }
  }

  function addNotificationForTransaction(transaction: Transaction) {
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
    if (pendingOrderActivity.value.length) {
      const orders = await Promise.all(
        pendingOrderActivity.value.map(transaction =>
          gnosisOperator.getOrder(transaction.id)
        )
      );

      orders.forEach(order => {
        if (order != null && order.status === 'fulfilled') {
          finalizeTransaction(order.uid, 'order', order);
        }
      });
    }

    if (pendingTxActivity.value.length) {
      const txs = await Promise.all(
        pendingTxActivity.value.map(transaction =>
          provider.value.getTransactionReceipt(transaction.id)
        )
      );

      txs.forEach(tx => {
        if (tx != null) {
          finalizeTransaction(tx.transactionHash, 'tx', tx);
        }
      });
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
