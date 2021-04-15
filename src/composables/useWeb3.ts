import { computed } from 'vue';
import { useStore } from 'vuex';

import configs from '@/config';

export default function useWeb3() {
  const store = useStore();

  const account = computed(() => store.state.web3.account);
  const blockNumber = computed(() => store.state.web3.blockNumber);

  // App Network vars (static)
  const appNetwork = {
    key: process.env.VUE_APP_NETWORK || '1',
    id: Number(process.env.VUE_APP_NETWORK) || 1,
    name: configs[Number(process.env.VUE_APP_NETWORK)].shortName || 'Mainnet'
  };

  // User network vars (dynamic)
  const userNetwork = computed(() => {
    return {
      key: store.state.web3.config.key,
      id: store.state.web3.config.chainId,
      name: store.state.web3.config.shortName
    };
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

  return {
    explorer,
    appNetwork,
    userNetwork,
    account,
    blockNumber,
    isMainnet,
    unsupportedNetwork,
    networkMismatch
  };
}
