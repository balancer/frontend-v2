import { getProfile } from '@/lib/utils/profile';
import axios from 'axios';
import { computed, inject, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { Web3Provider, Web3ProviderSymbol } from './web3.plugin';

export default function useVueWeb3() {
  const {
    connectWallet,
    account,
    chainId,
    provider,
    disconnectWallet
  } = inject(Web3ProviderSymbol) as Web3Provider;

  const canLoadProfile = computed(
    () => account.value !== '' && chainId.value !== 0
  );

  // TODO separate this out?
  const { isLoading: isLoadingProfile, data: profile } = useQuery(
    ['WEB3_PROFILE', { account, chainId }],
    () => getProfile(account.value, String(chainId.value)),
    reactive({
      enabled: canLoadProfile
    })
  );

  // TODO seperate this out?
  // load up a list of all the evm chains
  const { data: evmChains, isLoading: isLoadingEvmChains } = useQuery(
    'EVM_CHAINS',
    async () =>
      await (await axios.get('https://chainid.network/chains.json')).data
  );

  const networkName = computed(() => {
    if (!isLoadingEvmChains.value) {
      const chain = evmChains.value.find(
        chain => chain.networkId === chainId.value
      );
      return chain?.name || 'Unknown Network';
    }
    return 'Loading...';
  });

  return {
    connectWallet,
    account,
    chainId,
    web3: provider,
    isLoadingProfile,
    profile,
    networkName,
    disconnectWallet
  };
}
