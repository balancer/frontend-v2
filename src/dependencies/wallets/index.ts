import { initGnosisConnector } from './gnosis';
import { initMetamaskConnector } from './metamask';
import { initTallyConnector } from './tally';
import { initWalletconnectConnector } from './walletconnect';
import { initWalletLinkConnector } from './walletlink';

export function initWalletConnectors() {
  initWalletconnectConnector();
  initMetamaskConnector();
  initGnosisConnector();
  initWalletLinkConnector();
  initTallyConnector();
}
