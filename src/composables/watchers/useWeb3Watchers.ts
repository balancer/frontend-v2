import { EthereumTransactionData } from 'bnc-sdk/dist/types/src/interfaces';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { BLOCKED_ADDRESSES } from '@/constants/blocked';
import { includesAddress } from '@/lib/utils';
import useWeb3 from '@/services/web3/useWeb3';

import useAlerts, { AlertPriority, AlertType } from '../useAlerts';
import useBlocknative from '../useBlocknative';
import useTokens from '../useTokens';
import useTransactions, { ReplacementReason } from '../useTransactions';

export default function useWeb3Watchers() {
  // COMPOSABLES
  const { t } = useI18n();
  const { blocknative, supportsBlocknative } = useBlocknative();
  const {
    appNetworkConfig,
    chainId,
    account,
    isMismatchedNetwork,
    isUnsupportedNetwork,
    blockNumber,
    connectToAppNetwork,
    isWalletReady,
    disconnectWallet,
  } = useWeb3();
  const { addAlert, removeAlert } = useAlerts();
  const { refetchBalances, refetchAllowances } = useTokens();
  const { handlePendingTransactions, updateTransaction } = useTransactions();

  function handleTransactionReplacement(
    tx: EthereumTransactionData,
    replacementReason: ReplacementReason
  ) {
    const originalHash = tx.replaceHash;

    if (originalHash != null) {
      updateTransaction(originalHash, 'tx', {
        // new id
        id: tx.hash,
        replacementReason,
      });
    }
  }

  function checkIsUnsupportedNetwork() {
    if (
      chainId.value &&
      (isUnsupportedNetwork.value || isMismatchedNetwork.value)
    ) {
      addAlert({
        id: 'network-mismatch',
        label: t('networkMismatch', [appNetworkConfig.name]),
        type: AlertType.ERROR,
        persistent: true,
        action: connectToAppNetwork,
        actionLabel: t('switchNetwork'),
        priority: AlertPriority.HIGH,
      });
    } else {
      removeAlert('network-mismatch');
    }
  }

  // Watch for user account change:
  // -> Unsubscribe Blocknative from old account if exits
  // -> Listen to new account for transactions and update balances
  watch(
    () => account.value,
    (newAccount, oldAccount) => {
      if (supportsBlocknative.value) {
        if (oldAccount) blocknative.unsubscribe(oldAccount);
        if (!newAccount) return;

        const { emitter } = blocknative.account(newAccount);
        emitter.on('txConfirmed', () => {
          refetchBalances.value();
          refetchAllowances.value();
        });

        emitter.on('txSpeedUp', tx =>
          handleTransactionReplacement(
            tx as EthereumTransactionData,
            'txSpeedUp'
          )
        );

        emitter.on('txCancel', tx =>
          handleTransactionReplacement(
            tx as EthereumTransactionData,
            'txCancel'
          )
        );
      }
    }
  );

  // Watch for user network switch
  // -> Display alert message if unsupported or not the same as app network.
  watch(chainId, () => {
    checkIsUnsupportedNetwork();
  });

  watch(isWalletReady, () => {
    checkIsUnsupportedNetwork();
  });

  watch(blockNumber, async () => {
    if (isWalletReady.value) {
      handlePendingTransactions();
    }
  });

  watch(account, () => {
    if (includesAddress(BLOCKED_ADDRESSES, account.value)) {
      disconnectWallet();
    }
  });
}
