import { initWalletconnectConnectorForTesting } from '@/dependencies/wallets/walletconnect';
import { initWalletLinkConnectorForTesting } from '@/dependencies/wallets/walletlink';
import { initSafeConnectorForTesting } from '@/dependencies/wallets/safe';
import { initMetamaskConnectorForTesting } from './metamask';
import {
  WalletLinkConnectorMock,
  WalletConnectConnectorMock,
  SafeConnectorMock,
  MetamaskConnectorMock,
  TallyConnectorMock,
} from './wallet-connector-mocks';
import { initTallyConnectorForTesting } from './tally';

export function initWalletConnectorsWithDefaultMocks() {
  initWalletconnectConnectorForTesting(WalletConnectConnectorMock);
  initMetamaskConnectorForTesting(MetamaskConnectorMock);
  initSafeConnectorForTesting(SafeConnectorMock);
  initWalletLinkConnectorForTesting(WalletLinkConnectorMock);
  initTallyConnectorForTesting(TallyConnectorMock);
}
