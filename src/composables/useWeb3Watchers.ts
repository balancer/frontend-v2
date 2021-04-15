import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import useBlocknative from './useBlocknative';
import useWeb3 from './useWeb3';

export default function useWeb3Watchers() {
  // COMPOSABLES
  const store = useStore();
  const { t } = useI18n();
  const { notify } = useBlocknative();
  const {
    appNetwork,
    userNetwork,
    unsupportedNetwork,
    networkMismatch
  } = useWeb3();

  // Watch for user account change:
  // -> Unsubscribe Blocknative from old account if exits
  // -> Listen to new account for transactions and update balances
  watch(
    () => store.state.web3.account,
    (newAccount, oldAccount) => {
      if (oldAccount) notify.unsubscribe(oldAccount);
      if (!newAccount) return;

      const { emitter } = notify.account(newAccount);
      emitter.on('all', transaction => {
        if (transaction.status === 'confirmed') {
          store.dispatch('account/getBalances');
          store.dispatch('account/getAllowances');
        }
        return false;
      });
    }
  );

  // Watch for user network switch
  // -> Display alert message if unsupported or not the same as app network.
  watch(
    () => userNetwork.value.name,
    () => {
      if (unsupportedNetwork.value) {
        const localeKey = userNetwork.value.name
          ? 'unavailableOnNetworkWithName'
          : 'unavailableOnNetwork';
        store.commit('alerts/setCurrent', {
          label: t(localeKey, [userNetwork.value.name, appNetwork.name]),
          type: 'error',
          persistant: true
        });
      } else if (networkMismatch.value) {
        store.commit('alerts/setCurrent', {
          label: t('networkMismatch', [appNetwork.name]),
          type: 'error',
          persistant: true
        });
      } else {
        store.commit('alerts/setCurrent', null);
      }
    }
  );
}
