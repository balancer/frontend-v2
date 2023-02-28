import debounce from 'lodash/debounce';

import {
  getInjectedProvider,
  hasInjectedProvider,
} from '@/services/web3/connectors/metamask/metamask.connector';

import { Wallet, Web3Plugin, Web3ProviderSymbol } from './web3.plugin';

/** STATE */
const isWalletSelectVisible = ref(false);

const toggleWalletSelectModal = (value?: boolean) => {
  isWalletSelectVisible.value = value ?? !isWalletSelectVisible.value;
};
const delayedToggleWalletSelectModal = debounce(toggleWalletSelectModal, 200);

export default function useWeb3() {
  const walletState = ref('disconnected');
  async function connectWallet(wallet) {
    return;
  }
  // const { walletState, connectWallet } = inject(
  //   Web3ProviderSymbol
  // ) as Web3Plugin;

  const isWalletDisconnected = computed(
    () => walletState.value === 'disconnected'
  );

  // METHODS
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

  return {
    // methods
    startConnectWithInjectedProvider,
  };
}
