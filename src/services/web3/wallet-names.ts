import { useI18n } from 'vue-i18n';
import { ConnectorId } from './connectors/connector';

export function getConnectorName(
  connectorId: ConnectorId,
  provider: any
): string {
  const { t } = useI18n();

  if (!provider) {
    return t('unknown');
  }
  if (connectorId === ConnectorId.InjectedMetaMask) {
    if (provider.isCoinbaseWallet) {
      return `Coinbase ${t('wallet')}`;
    }
    if (provider.isMetaMask) {
      return 'MetaMask';
    }
    if (provider.isImToken) {
      return 'imToken';
    }
    if (provider.isStatus) {
      return 'Status';
    }
    if (provider.isTrust) {
      return 'Trust Wallet';
    }
    if (provider.isFrame) {
      return 'Frame';
    }
    return t('browserWallet');
  }
  if (connectorId === ConnectorId.InjectedTally) {
    return 'Tally';
  }
  if (connectorId === ConnectorId.WalletConnect) {
    return 'WalletConnect';
  }
  if (connectorId === ConnectorId.WalletLink) {
    return `Coinbase ${t('wallet')}`;
  }
  if (connectorId === ConnectorId.Gnosis) {
    return 'Gnosis Safe';
  }
  return t('unknown');
}

export function isWalletConnectWallet(connectorId: ConnectorId) {
  return connectorId === ConnectorId.WalletConnect;
}
