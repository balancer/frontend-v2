import { getProfile } from '@/lib/utils/profile';
import { computed, inject, reactive, ref, watch } from 'vue';
import { useQuery } from 'vue-query';
import { Web3Plugin, Web3ProviderSymbol } from './web3.plugin';
import { Web3Provider } from '@ethersproject/providers';
import QUERY_KEYS from '@/constants/queryKeys';
import ConfigService from '../config/config.service';
import { isAddress } from '@ethersproject/address';
import { useStore } from 'vuex';

const isWalletSelectVisible = ref(false);

export default function useVueWeb3() {
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
  const configService = new ConfigService();
  const appNetworkConfig = configService.network;
  const isV1Supported = isAddress(
    configService.network.addresses.exchangeProxy
  );
  const store = useStore();

  // COMPUTED REFS + COMPUTED REFS
  const blockNumber = computed(() => store.state.web3.blockNumber);
  const userNetworkConfig = computed(() => {
    return configService.getNetworkConfig(String(chainId.value));
  });
  const isWalletReady = computed(() => walletState.value === 'connected');
  const isMainnet = computed(() => appNetworkConfig.chainId === 1);
  const isPolygon = computed(() => appNetworkConfig.chainId === 137);
  const canLoadProfile = computed(
    () => account.value !== '' && userNetworkConfig.value?.chainId !== 0
  );
  const isMismatchedNetwork = computed(() => {
    return (
      isWalletReady.value &&
      userNetworkConfig.value?.key !== process.env.VUE_APP_NETWORK
    );
  });
  const isUnsupportedNetwork = computed(() => {
    return isWalletReady.value && !userNetworkConfig.value?.key;
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
  const toggleWalletSelectModal = (value: boolean) => {
    if (value !== undefined && typeof value === 'boolean') {
      isWalletSelectVisible.value = value;
      return;
    }
    isWalletSelectVisible.value = !isWalletSelectVisible.value;
  };

  const { isLoading: isLoadingProfile, data: profile } = useQuery(
    QUERY_KEYS.Account.Profile(account, userNetworkConfig),
    () => getProfile(account.value, String(userNetworkConfig.value?.chainId)),
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
    isPolygon,

    // methods
    connectWallet,
    getProvider,
    getSigner,
    disconnectWallet,
    toggleWalletSelectModal
  };
}
