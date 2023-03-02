import { initGnosisConnector } from './gnosis';
import { initMetamaskConnector } from './metamask';
import { initTallyConnector } from './tally';
import { initWalletConnectConnector } from './walletConnect';
import { initWalletLinkConnector } from './walletlink';

export function initWalletConnectors() {
  initWalletConnectConnector();
  initMetamaskConnector();
  initGnosisConnector();
  initWalletLinkConnector();
  initTallyConnector();
}
