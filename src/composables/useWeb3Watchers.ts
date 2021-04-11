import { watch, ref, computed } from 'vue';
import { useStore } from 'vuex';
import useBlocknative from './useBlocknative';
import InfuraService from '@/services/infura/service';
import { getAddress } from '@ethersproject/address';

export default function useWeb3Watchers() {
  // COMPOSABLES
  const store = useStore();
  const { notify } = useBlocknative();

  // DATA
  const loading = ref(false);

  // SERVICES
  const infuraService = new InfuraService(store.state.web3.config.chainId);

  // COMPUTED
  const unsupportedNetwork = computed(() => {
    return store.state.web3.config.unknown;
  });

  // METHODS
  const setBlockNumber = (blockNumber: number) =>
    store.commit('web3/setBlockNumber', blockNumber);

  async function updatePools(chainId: number): Promise<void> {
    await store.dispatch('pools/getAll', chainId);
  }

  async function updateTokens(): Promise<void> {
    const pools = store.state.pools.all;
    const tokens = pools
      .map(pool => pool.tokens.map(token => getAddress(token.address)))
      .reduce((a, b) => [...a, ...b], []);
    await store.dispatch('registry/injectTokens', tokens);
  }

  // WATCHERS

  // Watch for network change:
  // -> Update Blocknative networkId
  // -> Re-init the block number listener
  // -> Update the global pools list
  // -> Update the global token list based on new pools
  watch(
    () => store.state.web3.config.chainId,
    async newChainId => {
      loading.value = true;
      notify.config({ networkId: newChainId });
      infuraService.switchNetwork(newChainId);
      infuraService.initBlockListener(setBlockNumber);
      await updatePools(newChainId);
      await updateTokens();
      loading.value = false;
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
        if (transaction.status === 'confirmed')
          store.dispatch('account/getBalances');
        return false;
      });
    }
  );

  return { loading, unsupportedNetwork };
}
