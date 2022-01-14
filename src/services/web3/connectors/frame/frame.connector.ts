import { Connector } from '../connector';
import ethProvider from 'eth-provider';
import { getAddress } from '@ethersproject/address';

export class FrameWalletConnector extends Connector {
  id = 'frame';
  async connect() {
    const provider = ethProvider('frame');

    if (provider) {
      this.provider = provider;
      this.active.value = true;

      let accounts = [];
      let chainId = null;
      // try the best practice way of get accounts with eth_requestAccounts && eth_chainId
      try {
        if (provider.request) {
          chainId = await provider.request({ method: 'eth_chainId' });
          this.handleChainChanged(chainId);
          accounts = await provider.request({
            method: 'eth_requestAccounts'
          });
        }

        if (accounts.length === 0) {
          // lets try to connect to previous account
          if (this.selectedAccount !== '') {
            this.account.value = getAddress(this.selectedAccount);
          }
        } else {
          await this.handleAccountsChanged(accounts);
        }
      } catch (err) {
        // lets try to connect to previous account in case of error
        if (this.selectedAccount !== '') {
          this.account.value = getAddress(this.selectedAccount);
        } else {
          // we throw here otherwise change handlers get attached which leads to weird behaviour
          throw err;
        }
      }
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.account,
      chainId: this.chainId
    };
  }

  // if you close an account this event gets fired with an empty accounts array
  handleAccountsChanged = async accounts => {
    console.log('ACC changed', accounts);
    console.log('selected', this.selectedAccount);

    if (accounts.length === 0) {
      const provider = ethProvider('frame');
      let refetchedAccounts = [];
      try {
        refetchedAccounts = await provider.request({
          method: 'eth_requestAccounts'
        });
      } catch (error) {
        console.error(error);
      }

      if (refetchedAccounts.length !== 0) {
        this.account.value = getAddress(refetchedAccounts[0]);
      }
    } else {
      this.account.value = getAddress(accounts[0]);
    }
  };
}
