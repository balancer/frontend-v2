import { computed } from 'vue';
import { useStore } from 'vuex';

import configs from '@/lib/config';
import getProvider from '@/lib/utils/provider';
import useAuth from '@/composables/useAuth';

export default function useWeb3() {
  const store = useStore();
  const { isAuthenticated } = useAuth();

  const account = computed(() => store.state.web3.account);
  const profile = computed(() => store.state.web3.profile);
  const blockNumber = computed(() => store.state.web3.blockNumber);
  const loading = computed(() => store.state.web3.loading);
  const isConnected = computed(() => isAuthenticated.value && !loading.value);

  // App Network vars (static)
  const appNetwork = {
    key: process.env.VUE_APP_NETWORK || '1',
    id: Number(process.env.VUE_APP_NETWORK) || 1,
    name: configs[Number(process.env.VUE_APP_NETWORK)].shortName || 'Mainnet',
    networkName:
      configs[Number(process.env.VUE_APP_NETWORK)].network || 'homestead'
  };

  // User network vars (dynamic)
  const userNetwork = computed(() => {
    return {
      key: store.state.web3.config.key,
      id: store.state.web3.config.chainId,
      name: store.state.web3.config.shortName
    };
  });

  const userProvider = computed(() => {
    return getProvider(userNetwork.value.key);
  });

  const isMainnet = computed(() => {
    return userNetwork.value.name === 'Mainnet';
  });

  const unsupportedNetwork = computed(() => {
    return store.state.web3.config.unknown;
  });

  const networkMismatch = computed(() => {
    return (
      !unsupportedNetwork.value &&
      userNetwork.value.key !== process.env.VUE_APP_NETWORK
    );
  });

  const explorerBaseURL = configs[appNetwork.id].explorer;

  // assumes etherscan.io
  const explorer = {
    txLink: (txHash: string) => `${explorerBaseURL}/tx/${txHash}`,
    addressLink: (address: string) => `${explorerBaseURL}/address/${address}`,
    tokenLink: (address: string) => `${explorerBaseURL}/token/${address}`
  };

  function shortenLabel(str, segLength = 4) {
    const firstSegment = str.substring(0, segLength + 2);
    const lastSegment = str.substring(str.length, str.length - segLength);
    return `${firstSegment}...${lastSegment}`;
  }

  return {
    explorer,
    appNetwork,
    userNetwork,
    userProvider,
    account,
    profile,
    loading,
    blockNumber,
    isMainnet,
    unsupportedNetwork,
    networkMismatch,
    isConnected,
    shortenLabel
  };
}
