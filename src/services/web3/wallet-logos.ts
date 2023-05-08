import defaultLogo from '@/assets/images/connectors/default.svg';
import frameLogo from '@/assets/images/connectors/frame.svg';
import imtokenLogo from '@/assets/images/connectors/imtoken.svg';
import metamaskLogo from '@/assets/images/connectors/metamask.svg';
import statusLogo from '@/assets/images/connectors/status.svg';
import tallyLogo from '@/assets/images/connectors/tally.svg';
import trustwalletLogo from '@/assets/images/connectors/trustwallet.svg';
import walletconnectLogo from '@/assets/images/connectors/walletconnect.svg';
import walletlinkLogo from '@/assets/images/connectors/walletlink.svg';
import { ConnectorId } from './connectors/connector';

export function getConnectorLogo(
  connectorId: ConnectorId,
  provider: any
): string {
  if (!provider) {
    return defaultLogo;
  }
  if (connectorId === ConnectorId.InjectedMetaMask) {
    if (provider.isTally) {
      return tallyLogo;
    }
    if (provider.isCoinbaseWallet) {
      // walletlink is also a coinbase wallet
      return walletlinkLogo;
    }
    if (provider.isImToken) {
      return imtokenLogo;
    }
    if (provider.isStatus) {
      return statusLogo;
    }
    if (provider.isTrust) {
      return trustwalletLogo;
    }
    if (provider.isFrame) {
      return frameLogo;
    }
    return metamaskLogo;
  }
  if (connectorId === ConnectorId.InjectedTally) {
    return tallyLogo;
  }
  if (connectorId === ConnectorId.WalletConnect) {
    return walletconnectLogo;
  }
  if (connectorId === ConnectorId.WalletLink) {
    return walletlinkLogo;
  }
  return defaultLogo;
}
