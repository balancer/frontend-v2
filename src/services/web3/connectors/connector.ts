import { ref, Ref } from 'vue';
import Web3 from 'web3';
import { getAddress } from '@ethersproject/address';

export type ConnectorPayload = {
  provider: Web3;
  account: Ref<string | null>;
  chainId: Ref<number | null>;
};
export abstract class Connector {
  provider: any = null;
  account: Ref<string | null> = ref(null);
  chainId: Ref<number | null> = ref(null);
  active: Ref<boolean> = ref(false);
  selectedAccount = '';

  constructor(selectedAccount: string) {
    this.selectedAccount = selectedAccount || '';
  }

  // must return the provider
  abstract connect(): Promise<ConnectorPayload>;

  handleAccountsChanged = accounts => {
    if (this.selectedAccount !== '') {
      const account = accounts.find(
        a => getAddress(a) === getAddress(this.selectedAccount)
      );
      // sense check the account that was previously connected
      if (!account) {
        this.account.value = accounts[0];
        throw new Error(
          `Previously connected account [${this.selectedAccount}] was not found in the connection. Defaulting to the first.`
        );
      }
      this.account.value = getAddress(this.selectedAccount);
    }
    this.account.value = getAddress(accounts[0]);
  };

  handleChainChanged = chainId => {
    this.chainId.value = Number(chainId);
  };

  handleDisconnect = () => {
    // reset everything
    this.provider?.removeAllListeners();
    this.account.value = null;
    this.chainId.value = null;
    this.active.value = false;
    this.selectedAccount = '';
  };

  registerListeners() {
    if (!this.provider) {
      throw new Error(
        'No provider registered for this connector. Something is very wrong.'
      );
    }

    this.provider.on('accountsChanged', this.handleAccountsChanged);
    this.provider.on('chainChanged', this.handleChainChanged);
    this.provider.on('disconnect', this.handleDisconnect);
  }
}
