import { inject, watch } from 'vue';
import {
  Web3AccountSymbol,
  Web3Provider,
  Web3ProviderSymbol
} from './Web3Provider';

export default function useVueWeb3() {
  const { connectWallet, account, chainId } = inject(
    Web3ProviderSymbol
  ) as Web3Provider;
  // TODO type this

  watch(account as any, () => console.log('acc', account.value));
  watch(chainId as any, () => console.log('chain', chainId.value));

  return {
    connectWallet
  };
}
