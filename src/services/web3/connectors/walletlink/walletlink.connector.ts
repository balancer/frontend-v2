import WalletLink from 'walletlink';

import ConfigService from '@/services/config/config.service';
import { WalletError } from '@/types';

import { Connector, ConnectorId } from '../connector';

export class WalletLinkConnector extends Connector {
  id = ConnectorId.WalletLink;
  async connect() {
    const configService = new ConfigService();
    const walletLink = new WalletLink({
      appName: 'Balancer',
      appLogoUrl: '~@/assets/images/logo-dark.svg',
      darkMode: false,
    });
    const provider = walletLink.makeWeb3Provider(
      configService.rpc,
      configService.network.chainId
    );
    this.provider = provider;

    try {
      const accounts = await provider.enable();

      const chainId = await provider.request({ method: 'eth_chainId' });
      this.handleChainChanged(chainId);
      this.handleAccountsChanged(accounts);
    } catch (err) {
      if ((err as WalletError).code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Rejected connection.');
      } else {
        console.error(err);
      }
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.account,
      chainId: this.chainId,
    };
  }
}
