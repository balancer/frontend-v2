import { watch } from 'vue';
import { useStore } from 'vuex';
import useBlocknative from './useBlocknative';

export default function useWeb3Watchers() {
  // COMPOSABLES
  const store = useStore();
  const { notify } = useBlocknative();

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
}
