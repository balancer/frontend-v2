import { Connector } from '../Connector';

export class MetamaskConnector extends Connector {
  async connect() {
    const provider = window.ethereum;
    if (provider) {
      this.provider = provider;
      this.active.value = true;

      const chainId = await provider.request({ method: 'eth_chainId' });
      this.handleChainChanged(chainId);

      const accounts = await provider.request({ method: 'eth_accounts' });
      this.handleAccountsChanged(accounts);
    } else {
      console.error(
        'Tried to connect to MetaMask but it was not detected. Please install MetaMask.'
      );
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.accounts,
      chainId: this.chainId
    };
  }
}
