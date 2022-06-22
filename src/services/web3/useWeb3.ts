import { Network } from '@balancer-labs/sdk';
import { Web3Provider } from '@ethersproject/providers';
import { computed, inject, reactive, ref } from 'vue';
import { useQuery } from 'vue-query';

import useNetwork from '@/composables/useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';
import { hasInjectedProvider } from '@/services/web3/connectors/metamask/metamask.connector';

import { configService } from '../config/config.service';
import { rpcProviderService } from '../rpc-provider/rpc-provider.service';
import { switchToAppNetwork } from './utils/helpers';
import { Web3Plugin, Web3ProviderSymbol } from './web3.plugin';
import { web3Service } from './web3.service';

/** STATE */
const blockNumber = ref(0);
const isWalletSelectVisible = ref(false);

/** MUTATIONS */
function setBlockNumber(n: number): void {
  blockNumber.value = n;
}

/** INIT STATE */
rpcProviderService.initBlockListener(setBlockNumber);

const toggleWalletSelectModal = (value?: boolean) => {
  isWalletSelectVisible.value = value ?? !isWalletSelectVisible.value;
};

export default function useWeb3() {
  const {
    account,
    chainId,
    connector,
    provider,
    walletState,
    signer,
    disconnectWallet,
    connectWallet,
    isSanctioned
  } = inject(Web3ProviderSymbol) as Web3Plugin;
  const appNetworkConfig = configService.network;

  const { networkId } = useNetwork();

  // COMPUTED REFS + COMPUTED REFS
  const userNetworkConfig = computed(() => {
    try {
      if (chainId.value) return configService.getNetworkConfig(chainId.value);
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  });
  const isWalletReady = computed(() => walletState.value === 'connected');
  const isWalletConnecting = computed(() => walletState.value === 'connecting');
  const isMainnet = computed(
    () => appNetworkConfig.chainId === Network.MAINNET
  );
  const isKovan = computed(() => appNetworkConfig.chainId === Network.KOVAN);
  const isGoerli = computed(() => appNetworkConfig.chainId === Network.GOERLI);
  const isPolygon = computed(
    () => appNetworkConfig.chainId === Network.POLYGON
  );
  const isArbitrum = computed(
    () => appNetworkConfig.chainId === Network.ARBITRUM
  );
  const isEIP1559SupportedNetwork = computed(
    () => appNetworkConfig.supportsEIP1559
  );

  const canLoadProfile = computed(
    () => account.value !== '' && userNetworkConfig.value !== null
  );
  const isMismatchedNetwork = computed(() => {
    return (
      isWalletReady.value &&
      userNetworkConfig.value?.key !== appNetworkConfig.key
    );
  });
  const isUnsupportedNetwork = computed(() => {
    return isWalletReady.value && userNetworkConfig.value === null;
  });
  const explorerLinks = {
    txLink: (txHash: string) =>
      `${configService.network.explorer}/tx/${txHash}`,
    addressLink: (address: string) =>
      `${configService.network.explorer}/address/${address}`,
    tokenLink: (address: string) =>
      `${configService.network.explorer}/token/${address}`
  };

  // METHODS
  const getProvider = () => new Web3Provider(provider.value as any);
  const getSigner = () => getProvider().getSigner();
  const connectToAppNetwork = () => switchToAppNetwork(provider.value as any);

  function tryConnectWithInjectedProvider(): void {
    // Open wallet select modal because even if there's injected provider,
    // user might want to reject it and use another wallet.
    // If user has already accepted the injected provider, modal will be closed after
    // wallet is connected
    toggleWalletSelectModal();
    if (hasInjectedProvider()) {
      // Immediately try to connect with injected provider
      connectWallet('metamask').then(() => {
        // Close the modal after connected
        toggleWalletSelectModal(false);
      });
    }
  }

  const { isLoading: isLoadingProfile, data: profile } = useQuery(
    QUERY_KEYS.Account.Profile(networkId, account, chainId),
    () => web3Service.getProfile(account.value),
    reactive({
      enabled: canLoadProfile
    })
  );

  return {
    // refs
    account,
    chainId,
    profile,
    connector,
    provider,
    walletState,
    userNetworkConfig,
    appNetworkConfig,
    isLoadingProfile,
    isWalletReady,
    isWalletSelectVisible,
    isMismatchedNetwork,
    isUnsupportedNetwork,
    explorerLinks,
    signer,
    blockNumber,
    isMainnet,
    isKovan,
    isGoerli,
    isPolygon,
    isArbitrum,
    isEIP1559SupportedNetwork,
    isWalletConnecting,
    isSanctioned,

    // methods
    connectWallet,
    connectToAppNetwork,
    getProvider,
    getSigner,
    disconnectWallet,
    toggleWalletSelectModal,
    tryConnectWithInjectedProvider,
    setBlockNumber
  };
}
