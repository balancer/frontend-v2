import { getAddress } from '@ethersproject/address';
import { Ref, ref } from 'vue';

import { lsRemove } from '@/lib/utils';

export type ConnectorPayload = {
  provider: unknown;
  account: Ref<string | null>;
  chainId: Ref<number | null>;
};

export enum ConnectorId {
  InjectedMetaMask = 'injectedMetamask',
  InjectedTally = 'injectedTally',
  WalletConnect = 'walletconnect',
  WalletLink = 'walletlink',
  Gnosis = 'gnosis',
  Unknown = 'unknown',
}
export abstract class Connector {
  provider: any = null;
  account: Ref<string | null> = ref(null);
  chainId: Ref<number | null> = ref(null);
  active: Ref<boolean> = ref(false);
  selectedAccount = '';
  id: ConnectorId = ConnectorId.Unknown;

  constructor(selectedAccount: string) {
    this.selectedAccount = selectedAccount || '';
  }

  // must return the provider
  abstract connect(): Promise<ConnectorPayload>;

  handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      this.handleDisconnect();
    } else {
      if (this.selectedAccount !== '') {
        const account = accounts.find(
          account => getAddress(account) === getAddress(this.selectedAccount)
        );
        // sense check the account that was previously connected
        if (!account) {
          this.account.value = accounts[0];
          console.warn(
            `Previously connected account [${this.selectedAccount}] was not found in the connection. Defaulting to the first.`
          );
        }
        this.account.value = getAddress(this.selectedAccount);
      }
      this.account.value = getAddress(accounts[0]);
    }
  };

  handleChainChanged = chainId => {
    this.chainId.value = Number(chainId);
  };

  handleDisconnect = () => {
    // reset everything
    if (this.provider?.removeAllListeners) this.provider?.removeAllListeners();
    this.account.value = null;
    this.chainId.value = null;
    this.active.value = false;
    this.selectedAccount = '';
    if (this.provider.disconnect) {
      this.provider.disconnect();
    }
    if (this.provider.close) {
      this.provider.close();
    }
    lsRemove('connectedWallet');
    lsRemove('connectedProvider');
  };

  registerListeners() {
    if (!this.provider) {
      throw new Error(
        'No provider registered for this connector. Something is very wrong.'
      );
    }

    this.provider.on('accountsChanged', this.handleAccountsChanged);
    this.provider.on('chainChanged', this.handleChainChanged);
  }
}
