import WalletConnectProvider from '@walletconnect/web3-provider';

import ConfigService from '@/services/config/config.service';
import template from '@/lib/utils/template';
import { WalletError } from '@/types';
import { Network } from '@balancer-labs/sdk';
import { Connector, ConnectorId } from '../connector';

export class WalletConnectConnector extends Connector {
  id = ConnectorId.WalletConnect;
  async connect() {
    const configService = new ConfigService();
    const provider = new WalletConnectProvider({
      rpc: {
        [Network.MAINNET]: template(
          configService.getNetworkConfig(Network.MAINNET).rpc,
          {
            INFURA_KEY: configService.getNetworkConfig(Network.MAINNET).keys
              .infura,
            ALCHEMY_KEY: configService.getNetworkConfig(Network.MAINNET).keys
              .alchemy,
          }
        ),
        [Network.POLYGON]: template(
          configService.getNetworkConfig(Network.POLYGON).rpc,
          {
            INFURA_KEY: configService.getNetworkConfig(Network.POLYGON).keys
              .infura,
            ALCHEMY_KEY: configService.getNetworkConfig(Network.POLYGON).keys
              .alchemy,
          }
        ),
        [Network.ARBITRUM]: template(
          configService.getNetworkConfig(Network.ARBITRUM).rpc,
          {
            INFURA_KEY: configService.getNetworkConfig(Network.ARBITRUM).keys
              .infura,
            ALCHEMY_KEY: configService.getNetworkConfig(Network.ARBITRUM).keys
              .alchemy,
          }
        ),
      },
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
