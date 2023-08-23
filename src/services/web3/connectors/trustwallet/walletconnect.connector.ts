import { EthereumProvider } from '@walletconnect/ethereum-provider';

import { configService } from '@/services/config/config.service';
import { WalletError } from '@/types';
import { Connector, ConnectorId } from '../connector';
import { Network } from '@/lib/config/types';
import useDarkMode from '@/composables/useDarkMode';

const { MAINNET, ARBITRUM, AVALANCHE, BASE, GNOSIS, POLYGON, ZKEVM } = Network;

export class WalletConnectConnector extends Connector {
  id = ConnectorId.WalletConnect;
  async connect() {
    const provider = await EthereumProvider.init({
      projectId: 'ee9c0c7e1b8b86ebdfb8fd93bb116ca8',
      chains: [MAINNET],
      optionalChains: [AVALANCHE, ARBITRUM, BASE, GNOSIS, POLYGON, ZKEVM],
      rpcMap: {
        [MAINNET]: configService.getNetworkRpc(MAINNET),
        [ARBITRUM]: configService.getNetworkRpc(ARBITRUM),
        [AVALANCHE]: configService.getNetworkRpc(AVALANCHE),
        [BASE]: configService.getNetworkRpc(BASE),
        [GNOSIS]: configService.getNetworkRpc(GNOSIS),
        [POLYGON]: configService.getNetworkRpc(POLYGON),
        [ZKEVM]: configService.getNetworkRpc(ZKEVM),
      },
      showQrModal: true,
      qrModalOptions: { themeMode: useDarkMode().darkMode ? 'dark' : 'light' },
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
