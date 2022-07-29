import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk';

import { Connector, ConnectorId } from '../connector';

export class GnosisSafeConnector extends Connector {
  id = ConnectorId.Gnosis;
  async connect() {
    const sdk = new SafeAppsSDK();
    const safe = await sdk.safe.getInfo();

    const provider = new SafeAppProvider(safe, sdk);

    if (provider) {
      this.provider = provider;
      this.active.value = true;
      this.handleChainChanged(safe.chainId);
      this.handleAccountsChanged([safe.safeAddress]);
    } else {
      console.error(
        'Tried to connect to Gnosis Safe but it was not detected. Please install make sure you are using the Gnosis interface.'
      );
    }
    return {
      // TODO type this
      provider: provider as any,
      account: this.account,
      chainId: this.chainId,
    };
  }
}
