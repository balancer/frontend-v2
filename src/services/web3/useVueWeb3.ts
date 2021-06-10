import { inject, ref, watch } from 'vue';
import { Web3Provider, Web3ProviderSymbol } from './web3.plugin';
import Web3 from 'web3';

export default function useVueWeb3() {
  const { connectWallet, account, chainId, provider, connector } = inject(
    Web3ProviderSymbol
  ) as Web3Provider;

  const web3 = ref<Web3 | null>(null);

  watch(connector, () => {
    if (connector) {
      web3.value = new Web3(provider);
    }
  });

  return {
    connectWallet,
    web3,
    account,
    chainId,
    provider
  };
}
