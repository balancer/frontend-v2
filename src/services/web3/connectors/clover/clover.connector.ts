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

      let accounts = null;
      let chainId = null;
      // try the best practice way of get accounts with eth_requestAccounts && eth_chainId
      try {
        if (provider.request) {
          accounts = await provider.request({
            method: 'eth_requestAccounts'
          });

          chainId = await provider.request({ method: 'eth_chainId' });
        }
      } catch (err) {
        if ((err as MetamaskError).code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Rejected connection');
        } else {
          console.error(err);
        }
      }

      this.handleChainChanged(chainId);
      this.handleAccountsChanged(accounts);
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.account,
      chainId: this.chainId
    };
  }
}
