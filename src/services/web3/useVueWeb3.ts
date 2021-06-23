import { getProfile } from '@/lib/utils/profile';
import axios from 'axios';
import { computed, inject, reactive, ref, watch } from 'vue';
import { useQuery } from 'vue-query';
import { Web3Plugin, Web3ProviderSymbol } from './web3.plugin';
import { Web3Provider } from '@ethersproject/providers';
import QUERY_KEYS from '@/constants/queryKeys';
import ConfigService from '../config/config.service';

const isWalletSelectVisible = ref(false);

export default function useVueWeb3() {
  const {
    connectWallet,
    account,
    chainId,
    disconnectWallet,
    connector,
    provider,
    walletState
  } = inject(Web3ProviderSymbol) as Web3Plugin;
  const appConfig = new ConfigService();

  const userNetworkConfig = computed(() =>
    appConfig.getNetworkConfig(String(chainId.value))
  );
  const appNetworkConfig = appConfig.network;

  // if the account ref has changed, we know that
  // the user has successfully connected a wallet
  watch(account, () => {
    toggleWalletSelectModal(false);
  });

  // METHODS
  const toggleWalletSelectModal = (value: boolean) => {
    if (value !== undefined && typeof value === 'boolean') {
      isWalletSelectVisible.value = value;
      return;
    }
    isWalletSelectVisible.value = !isWalletSelectVisible.value;
  };

  const isWalletReady = computed(() => walletState.value === 'connected');

  const canLoadProfile = computed(
    () => account.value !== '' && userNetworkConfig.value.chainId !== 0
  );

  const getProvider = () => new Web3Provider(provider.value as any);

  // TODO separate this out?
  const { isLoading: isLoadingProfile, data: profile } = useQuery(
    QUERY_KEYS.Account.Profile(account, userNetworkConfig),
    () => getProfile(account.value, String(userNetworkConfig.value.chainId)),
    reactive({
      enabled: canLoadProfile
    })
  );

  // TODO seperate this out?
  // load up a list of all the evm chains
  const { data: evmChains, isLoading: isLoadingEvmChains } = useQuery(
    QUERY_KEYS.App.Chains,
    async () => (await axios.get('https://chainid.network/chains.json')).data
  );

  const networkName = computed(() => {
    if (!isLoadingEvmChains.value) {
      const chain = evmChains.value.find(
        chain => chain.networkId === userNetworkConfig.value.chainId
      );
      return chain?.name || 'Unknown Network';
    }
    return 'Loading...';
  });

  return {
    connectWallet,
    account,
    chainId,
    getProvider,
    isLoadingProfile,
    profile,
    networkName,
    disconnectWallet,
    connector,
    provider,
    walletState,
    isWalletReady,
    toggleWalletSelectModal,
    isWalletSelectVisible,
    userNetworkConfig,
    appNetworkConfig
  };
}
