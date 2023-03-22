/* eslint-disable @typescript-eslint/no-empty-function */
// eslint-disable-next-line no-restricted-imports
import { SafeConnector } from '@/services/web3/connectors/gnosis/gnosis.connector';
import { MetamaskConnector } from '@/services/web3/connectors/metamask/metamask.connector';
import { TallyConnector } from '@/services/web3/connectors/tally/tally.connector';
import { WalletConnectConnector } from '@/services/web3/connectors/trustwallet/walletconnect.connector';
import { WalletLinkConnector } from '@/services/web3/connectors/walletlink/walletlink.connector';
import {
  ExternalProvider,
  JsonRpcSigner,
  // eslint-disable-next-line no-restricted-imports
  Web3Provider,
} from '@ethersproject/providers';
import { aSigner } from '@tests/unit/builders/signer';
import { mock } from 'vitest-mock-extended';

export const fakeMetamaskAccount = 'agorer.eth';
export const walletconnectAccount = 'vicentin.eth';
export const gnosisAccount = 'enjuto-mojamuto.eth';
export const walletLinkAccount = 'pitikli.eth';
export const tallyAccount = 'bonicodelto.eth';

export class MetamaskConnectorMock extends MetamaskConnector {
  registerListeners() {}
  // @ts-ignore
  connect() {
    return Promise.resolve({ account: ref(fakeMetamaskAccount) });
  }
  handleDisconnect = () => {};
}

export class WalletConnectConnectorMock extends WalletConnectConnector {
  registerListeners() {}
  // @ts-ignore
  connect() {
    return Promise.resolve({ account: ref(walletconnectAccount) });
  }
  handleDisconnect = () => {};
}

export class SafeConnectorMock extends SafeConnector {
  registerListeners() {}
  // @ts-ignore
  connect() {
    return Promise.resolve({ account: ref(gnosisAccount) });
  }
  handleDisconnect = () => {};
}

export class WalletLinkConnectorMock extends WalletLinkConnector {
  registerListeners() {}
  // @ts-ignore
  connect() {
    return Promise.resolve({ account: ref(walletLinkAccount) });
  }
  handleDisconnect = () => {};
}

export class TallyConnectorMock extends TallyConnector {
  registerListeners() {}
  // @ts-ignore
  connect() {
    return Promise.resolve({ account: ref(tallyAccount) });
  }
  handleDisconnect = () => {};
}

const externalProvider = mock<ExternalProvider>();

export class Web3ProviderMock extends Web3Provider {
  constructor() {
    super(externalProvider);
  }

  registerListeners() {}
  getSigner(): JsonRpcSigner {
    return aSigner();
  }
}
