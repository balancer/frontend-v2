import { computed, inject, reactive, ref, watch } from 'vue';
import { useQuery } from 'vue-query';
import { Web3Plugin, Web3ProviderSymbol } from './web3.plugin';
import { Web3Provider } from '@ethersproject/providers';
import QUERY_KEYS from '@/constants/queryKeys';
import { configService } from '../config/config.service';
import { isAddress } from '@ethersproject/address';
import { web3Service } from './web3.service';
import { rpcProviderService } from '../rpc-provider/rpc-provider.service';
import { switchToAppNetwork } from './utils/helpers';
import useNetwork, { Network } from '@/composables/useNetwork';

/** STATE */
const blockNumber = ref(0);
const isWalletSelectVisible = ref(false);

/** MUTATIONS */
function setBlockNumber(n: number): void {
  blockNumber.value = n;
}

/** INIT STATE */
rpcProviderService.initBlockListener(setBlockNumber);

export default function useWeb3() {
  const {
    account,
    chainId,
    connector,
    provider,
    walletState,
    signer,
    disconnectWallet,
    connectWallet
  } = inject(Web3ProviderSymbol) as Web3Plugin;
  const appNetworkConfig = configService.network;
  const isV1Supported = isAddress(
    configService.network.addresses.exchangeProxy
  );

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
  const isMainnet = computed(
    () => appNetworkConfig.chainId === Network.MAINNET
  );
  const isKovan = computed(() => appNetworkConfig.chainId === Network.KOVAN);
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
  const toggleWalletSelectModal = (value: boolean) => {
    if (value !== undefined && typeof value === 'boolean') {
      isWalletSelectVisible.value = value;
      return;
    }
    isWalletSelectVisible.value = !isWalletSelectVisible.value;
  };

  const { isLoading: isLoadingProfile, data: profile } = useQuery(
    QUERY_KEYS.Account.Profile(networkId, account, chainId),
    () => web3Service.getProfile(account.value),
    reactive({
      enabled: canLoadProfile
    })
  );

  // WATCHERS
  watch(account, () => {
    // if the account ref has changed, we know that
    // the user has successfully connected a wallet
    toggleWalletSelectModal(false);
  });

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
    isV1Supported,
    isMainnet,
    isKovan,
    isPolygon,
    isArbitrum,
    isEIP1559SupportedNetwork,

    // methods
    connectWallet,
    connectToAppNetwork,
    getProvider,
    getSigner,
    disconnectWallet,
    toggleWalletSelectModal,
    setBlockNumber
  };
}
