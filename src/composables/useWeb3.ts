import { computed } from 'vue';
import { useStore } from 'vuex';

import configs from '@/config';

export default function useWeb3() {
  const store = useStore();

  const appNetworkKey = process.env.VUE_APP_NETWORK;
  const appNetworkId = Number(appNetworkKey);
  const appNetworkName = configs[appNetworkId].shortName;
  const networkId = computed(() => store.state.web3.config.chainId);
  const networkKey = computed(() => store.state.web3.config.key);
  const networkName = computed(() => store.state.web3.config.shortName);
  const account = computed(() => store.state.web3.account);
  const blockNumber = computed(() => store.state.web3.blockNumber);

  const unsupportedNetwork = computed(() => {
    return store.state.web3.config.unknown;
  });

  const networkMismatch = computed(() => {
    return (
      !unsupportedNetwork.value &&
      networkKey.value !== process.env.VUE_APP_NETWORK
    );
  });

  const explorerBaseURL = configs[networkId.value].explorer;

  // assumes etherscan.io
  const explorer = {
    txLink: (txHash: string) => `${explorerBaseURL}/tx/${txHash}`,
    addressLink: (address: string) => `${explorerBaseURL}/address/${address}`,
    tokenLink: (address: string) => `${explorerBaseURL}/token/${address}`
  };

  return {
    explorer,
    appNetworkKey,
    appNetworkId,
    appNetworkName,
    networkId,
    networkKey,
    networkName,
    account,
    blockNumber,
    unsupportedNetwork,
    networkMismatch
  };
}
