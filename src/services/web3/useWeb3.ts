import { useQuery } from '@tanstack/vue-query';
import debounce from 'lodash/debounce';

import useNetwork from '@/composables/useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';
import {
  getInjectedProvider,
  hasInjectedProvider,
} from '@/services/web3/connectors/metamask/metamask.connector';

import { getWeb3Provider } from '@/dependencies/wallets/Web3Provider';
import { useWallets } from '@/providers/wallet.provider';
import { configService } from '../config/config.service';
import { rpcProviderService } from '../rpc-provider/rpc-provider.service';
import { switchToAppNetwork } from './utils/helpers';
import { walletService } from './wallet.service';

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
const delayedToggleWalletSelectModal = debounce(toggleWalletSelectModal, 200);

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
    isBlocked,
  } = useWallets();
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
  const isWalletDisconnected = computed(
    () => walletState.value === 'disconnected'
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
      `${configService.network.explorer}/token/${address}`,
  };

  // METHODS
  const Web3Provider = getWeb3Provider();
  const getProvider = () => new Web3Provider(provider.value as any, 'any'); // https://github.com/ethers-io/ethers.js/issues/866
  const getSigner = () => getProvider().getSigner();
  const connectToAppNetwork = () => switchToAppNetwork(provider.value as any);

  function startConnectWithInjectedProvider(): void {
    if (hasInjectedProvider() && getInjectedProvider().isCoinbaseWallet) {
      // Open wallet select modal because even if there's injected provider,
      // user might want to reject it and use another wallet.
      // If user has already accepted the injected provider, modal will be closed after
      // wallet is connected
      delayedToggleWalletSelectModal();
      // Immediately try to connect with injected provider
      connectWallet('metamask').then(() => {
        // If wallet is not ready, keep the modal open
        if (isWalletDisconnected.value) return;
        // When wallet is connected, close modal
        // and clear the delayed toggle timeout so the modal doesn't open
        delayedToggleWalletSelectModal.flush();
        toggleWalletSelectModal(false);
      });
    } else {
      // If there's no injected provider, open the modal immediately
      toggleWalletSelectModal();
    }
  }

  const { isLoading: isLoadingProfile, data: profile } = useQuery(
    QUERY_KEYS.Account.Profile(networkId, account, chainId),
    () => walletService.getProfile(account.value),
    reactive({
      enabled: canLoadProfile,
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
    isWalletConnecting,
    isBlocked,
    isWalletDisconnected,

    // methods
    connectWallet,
    connectToAppNetwork,
    getProvider,
    getSigner,
    disconnectWallet,
    toggleWalletSelectModal,
    startConnectWithInjectedProvider,
    setBlockNumber,
  };
}
