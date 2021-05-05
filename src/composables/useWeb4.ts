import { Web3Provider } from '@ethersproject/providers';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useQuery } from 'vue-query';
import useAuth from './useAuth';

export default function useWeb4() {
  const auth = useAuth();
  const network = ref<number | null>(null);
  const account = ref<string | null>(null);
  const connector = ref();

  const { isLoading, isIdle, refetch } = useQuery(
    reactive(['web3']),
    () => Promise.all([auth.web3.getNetwork(), auth.web3.listAccounts()]),
    reactive({
      onSuccess: ([_network, _accounts]) => {
        network.value = _network.chainId;
        account.value = _accounts.length > 0 ? _accounts[0] : null;
      },
      enabled: false
    })
  );

  onMounted(async () => {
    connector.value = await auth.getConnector();
    if (connector.value) {
      await auth.login(connector.value);
    }

    // initialise web3
    auth.web3 = new Web3Provider(auth.provider.value);
    refetch.value();

    // register listeners for wallet events
    // due to the way the auth instance works (not a ref)
    // we cannot rely on automatic refetching - so, have
    // to use manual refetching
    if (auth.provider.value && auth.provider.value.on) {
      // when changing wallet network e.g. kovan, mainnet
      auth.provider.value.on('chainChanged', async () => {
        console.log('changed chain')
        // reinitialise web3
        auth.web3 = new Web3Provider(auth.provider.value);
        refetch.value();
      });

      // when changing the connect wallet account
      auth.provider.value.on('accountsChanged', async () => {
        console.log('changed acc');

        // reinitialise web3
        auth.web3 = new Web3Provider(auth.provider.value);
        refetch.value();
      });

      // when remove wallet connection from the app
      auth.provider.value.on('disconnect', async () => {
        console.log('changed discc');

        // perform reset account logic here
      });
    }
  });

  const shouldResetListeners = computed(
    () =>
      auth.provider.value?.removeAllListeners && !auth.provider.value?.isTorus
  );

  watch(shouldResetListeners, () => {
    if (auth.provider.value && shouldResetListeners.value) {
      auth.provider.value.removeAllListeners();
    }
  });

  return {
    isLoading,
    isIdle,
    account,
    network,
    refetch
  };
}
