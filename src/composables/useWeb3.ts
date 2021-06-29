import { computed } from 'vue';
import { useStore } from 'vuex';

import getProvider from '@/lib/utils/provider';
import useAuth from '@/composables/useAuth';
import { NetworkId } from '@/constants/network';
import { isAddress } from '@ethersproject/address';
import ConfigService from '@/services/config/config.service';

export default function useWeb3() {
  const store = useStore();
  const { isAuthenticated } = useAuth();

  const account = computed(() => store.state.web3.account);
  const profile = computed(() => store.state.web3.profile);
  const blockNumber = computed(() => store.state.web3.blockNumber);
  const loading = computed(() => store.state.web3.loading);
  const isConnected = computed(() => isAuthenticated.value && !loading.value);

  const configService = new ConfigService();

  // App Network vars (static)
  const appNetwork = {
    key: configService.env.NETWORK,
    id: Number(configService.env.NETWORK) as NetworkId,
    name: configService.network.shortName,
    networkName: configService.network.network,
    nativeAsset: configService.network.nativeAsset,
    supportsV1: isAddress(configService.network.addresses.exchangeProxy)
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

  const isMainnet = computed(() => appNetwork.id === 1);

  const unsupportedNetwork = computed(() => {
    return store.state.web3.config.unknown;
  });

  const networkMismatch = computed(() => {
    return (
      unsupportedNetwork.value ||
      userNetwork.value.key !== process.env.VUE_APP_NETWORK
    );
  });

  const explorerBaseURL = configService.network.explorer;

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
