import { Connector } from '../connector';
import ConfigService from '@/services/config/config.service';
import { MetamaskError } from '@/types';
import { CloverConnector } from '@clover-network/clover-connector';

export class CloverWalletConnector extends Connector {
  id = 'clover';
  async connect() {
    const configService = new ConfigService();

    const cloverConnector = new CloverConnector({
      supportedChainIds: [configService.network.chainId]
    });

    const provider = await cloverConnector.getProvider();

    //const account = await cloverConnector.getAccount();
    if (provider) {
      this.provider = provider;
      this.active.value = true;

      try {
        if (provider.send) {
          const accounts = await provider.send('eth_accounts');
          const chainId = await provider.send('eth_chainId');
          this.handleChainChanged(chainId.result);
          this.handleAccountsChanged(accounts.result);
        }
      } catch (err) {
        if ((err as MetamaskError).code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Rejected connection.');
        } else {
          console.error(err);
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
}
