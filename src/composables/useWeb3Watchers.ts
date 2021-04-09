import { watch } from 'vue';
import useBlocknative from './useBlocknative';
import { useStore } from 'vuex';

export default function useWeb3Watchers(): void {
  const store = useStore();
  const { notify } = useBlocknative();

  // Watch for network change:
  // -> Update Blocknative networkId
  watch(
    () => store.state.web3.config.key,
    newNetwork => {
      notify.config({ networkId: Number(newNetwork) });
    },
    { immediate: true }
  );

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
        if (transaction.status === 'confirmed') store.dispatch('getBalances');
        return false;
      });
    }
  );
}
