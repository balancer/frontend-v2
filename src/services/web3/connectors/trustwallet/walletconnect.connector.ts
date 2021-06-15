import { Connector } from '../connector';
import WalletConnectProvider from '@walletconnect/web3-provider';
export class WalletConnectConnector extends Connector {
  async connect() {
    const provider = new WalletConnectProvider({
      infuraId: process.env.VUE_APP_INFURA_PROJECT_ID
    });
    this.provider = provider;

    try {
      const accounts = await provider.enable();

      const chainId = await provider.request({ method: 'eth_chainId' });
      this.handleChainChanged(chainId);
      this.handleAccountsChanged(accounts);
    } catch (err) {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to WalletConnect.');
      } else {
        console.error(err);
      }
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.account,
      chainId: this.chainId
    };
  }
}
