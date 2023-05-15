import WalletConnectProvider from './wallet-connect-provider';

import ConfigService from '@/services/config/config.service';
import config from '@/lib/config';
import { WalletError } from '@/types';
import { Network } from '@/lib/config';
import { Connector, ConnectorId } from '../connector';
import { Config } from '@/lib/config/types';

export class WalletConnectConnector extends Connector {
  id = ConnectorId.WalletConnect;
  async connect() {
    const configService = new ConfigService();
    const rpcUrls: Record<number, string> = {};
    Object.values(config).forEach((c: Config) => {
      if (!c.visibleInUI) return;
      rpcUrls[c.chainId] = configService.getNetworkRpc(c.chainId as Network);
    });
    const provider = new WalletConnectProvider({
      rpc: rpcUrls,
    });
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
        console.log('Please connect to WalletConnect.');
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
