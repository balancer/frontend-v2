import { WalletError } from '@/types';

import { Connector, ConnectorId } from '../connector';

export function getInjectedProvider() {
  const ethereum: any = window.ethereum;
  let provider = ethereum || (window as any).web3?.currentProvider;

  // if multiple providers are injected and one of them is Metamask, prefer Metamask
  if (ethereum?.providers?.length) {
    ethereum.providers.forEach(p => {
      if (p.isMetaMask) provider = p;
    });
  }
  return provider;
}

export function hasInjectedProvider(): boolean {
  return !!getInjectedProvider();
}
export class MetamaskConnector extends Connector {
  id = ConnectorId.InjectedMetaMask;
  async connect() {
    const provider = getInjectedProvider();
    // store userRejectedRequest error if the user rejects connection
    let userRejectedRequest = false;

    if (provider) {
      this.provider = provider;
      this.active.value = true;

      let accounts = null;
      let chainId = null;
      // try the best practice way of get accounts with eth_requestAccounts && eth_chainId
      try {
        if (provider.request) {
          accounts = await provider.request({
            method: 'eth_requestAccounts',
          });

          chainId = await provider.request({ method: 'eth_chainId' });
        }
      } catch (err) {
        if ((err as WalletError).code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          userRejectedRequest = true;
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      }

      // if account is still moot and user did not reject the connection request, try the bad old way - enable()
      if (!accounts && !userRejectedRequest) {
        // have to any it, since enable technically shouldn't be there anymore.
        // but might, for legacy clients.
        const response = await (provider as any).enable();
        accounts = response?.result || response;
      }

      if (accounts && chainId) {
        this.handleChainChanged(chainId);
        this.handleAccountsChanged(accounts);
      }
    } else {
      console.error(
        'Tried to connect to MetaMask but it was not detected. Please install MetaMask.'
      );
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.account,
      chainId: this.chainId,
    };
  }
}
