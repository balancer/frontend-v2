import { EventEmitter } from 'node:stream';
import { ref, Ref } from 'vue';
import Web3 from 'web3';

export type ConnectorPayload = {
  provider: Web3;
  account: Ref<string[] | null>;
  chainId: Ref<number | null>;
};

export abstract class Connector {
  provider: EventEmitter | null = null;
  accounts: Ref<string[] | null> = ref(null);
  chainId: Ref<number | null> = ref(null);
  active: Ref<boolean> = ref(false);

  // must return the provider
  abstract connect(): Promise<ConnectorPayload>;
  handleAccountsChanged = accounts => {
    this.accounts.value = accounts;
  };

  handleChainChanged = chainId => {
    this.chainId.value = Number(chainId);
  };

  handleDisconnect = () => {
    // reset everything
    this.provider?.removeAllListeners();
    this.accounts.value = null;
    this.chainId.value = null;
    this.active.value = false;
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
