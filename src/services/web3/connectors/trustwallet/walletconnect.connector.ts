import { EthereumProvider } from '@walletconnect/ethereum-provider';

import { configService } from '@/services/config/config.service';
import { WalletError } from '@/types';
import { Connector, ConnectorId } from '../connector';
import { Network } from '@/lib/config';

export class WalletConnectConnector extends Connector {
  id = ConnectorId.WalletConnect;
  async connect() {
    const provider = await EthereumProvider.init({
      projectId: 'ee9c0c7e1b8b86ebdfb8fd93bb116ca8',
      chains: [
        Network.MAINNET,
        Network.POLYGON,
        Network.ARBITRUM,
        Network.GNOSIS,
      ],
      rpcMap: {
        [Network.MAINNET]: configService.getNetworkRpc(Network.MAINNET),
        [Network.POLYGON]: configService.getNetworkRpc(Network.POLYGON),
        [Network.ARBITRUM]: configService.getNetworkRpc(Network.ARBITRUM),
        [Network.GNOSIS]: configService.getNetworkRpc(Network.GNOSIS),
      },
      showQrModal: true,
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
      provider,
      account: this.account,
      chainId: this.chainId,
    };
  }
}
