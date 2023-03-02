import { initWalletConnectConnectorForTesting } from '@/dependencies/wallets/walletConnect';
import { initWalletLinkConnectorForTesting } from '@/dependencies/wallets/walletlink';
import { initGnosisConnectorForTesting } from '@/dependencies/wallets/gnosis';
import { initMetamaskConnectorForTesting } from './metamask';
import {
  WalletLinkConnectorMock,
  WalletConnectConnectorMock,
  GnosisConnectorMock,
  MetamaskConnectorMock,
  TallyConnectorMock,
} from './wallet-connector-mocks';
import { initTallyConnectorForTesting } from './tally';

export function initWalletConnectorsWithDefaultMocks() {
  initWalletConnectConnectorForTesting(WalletConnectConnectorMock);
  initMetamaskConnectorForTesting(MetamaskConnectorMock);
  initGnosisConnectorForTesting(GnosisConnectorMock);
  initWalletLinkConnectorForTesting(WalletLinkConnectorMock);
  initTallyConnectorForTesting(TallyConnectorMock);
}
