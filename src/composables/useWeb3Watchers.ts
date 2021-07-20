import useWeb3 from '@/services/web3/useWeb3';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import useAccountBalances from './useAccountBalances';
import useAllowances from './useAllowances';
import useBlocknative from './useBlocknative';
import useTransactions from './useTransactions';

export default function useWeb3Watchers() {
  // COMPOSABLES
  const store = useStore();
  const { t } = useI18n();
  const { blocknative, supportsBlocknative } = useBlocknative();
  const {
    appNetworkConfig,
    userNetworkConfig,
    account,
    isMismatchedNetwork,
    isUnsupportedNetwork,
    blockNumber
  } = useWeb3();
  const { refetchAllowances } = useAllowances();
  const { refetchBalances } = useAccountBalances();
  const { handlePendingTransactions } = useTransactions();

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
      }
    }
  );

  // Watch for user network switch
  // -> Display alert message if unsupported or not the same as app network.
  watch(
    () => userNetworkConfig.value?.name,
    () => {
      if (isUnsupportedNetwork.value) {
        const localeKey = userNetworkConfig.value?.name
          ? 'unavailableOnNetworkWithName'
          : 'unavailableOnNetwork';
        store.commit('alerts/setCurrent', {
          label: t(localeKey, [
            userNetworkConfig.value?.name,
            appNetworkConfig.name
          ]),
          type: 'error',
          persistant: true
        });
      } else if (isMismatchedNetwork.value) {
        store.commit('alerts/setCurrent', {
          label: t('networkMismatch', [appNetworkConfig.name]),
          type: 'error',
          persistant: true
        });
      } else {
        store.commit('alerts/setCurrent', null);
      }
    }
  );

  watch(blockNumber, async () => {
    handlePendingTransactions();
  });
}
