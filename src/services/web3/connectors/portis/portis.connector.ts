import { Connector } from '../connector';
import Portis from '@portis/web3';
import ConfigService from '@/services/config/config.service';
import { MetamaskError } from '@/types';

export class PortisConnector extends Connector {
  id = 'portis';
  async connect() {
    const configService = new ConfigService();
    // The portis type is compeletely messed up and only
    // exports the default class and no extra types
    const portis = new Portis(
      configService.env.PORTIS_DAPP_ID,
      configService.network.portisNetwork || configService.network.network
    ) as any;

    const provider = portis.provider;

    if (provider) {
      this.provider = provider;
      this.active.value = true;

      try {
        if (provider.send) {
          const accounts = await provider.send('eth_accounts');
          const chainId = await provider.send('eth_chainId');
          this.handleChainChanged(chainId);
          this.handleAccountsChanged(accounts);
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
