import injected from '@snapshot-labs/lock/connectors/injected';
import fortmatic from '@snapshot-labs/lock/connectors/fortmatic';
import torus from '@snapshot-labs/lock/connectors/torus';
import portis from '@snapshot-labs/lock/connectors/portis';
import walletconnect from '@snapshot-labs/lock/connectors/walletconnect';
import walletlink from '@snapshot-labs/lock/connectors/walletlink';
import connectors from '@/constants/connectors.json';

import defaultLogo from '@/assets/connector/default.svg';
import fortmaticLogo from '@/assets/connector/fortmatic.svg';
import frameLogo from '@/assets/connector/frame.svg';
import imtokenLogo from '@/assets/connector/imtoken.svg';
import metamaskLogo from '@/assets/connector/metamask.svg';
import portisLogo from '@/assets/connector/portis.svg';
import statusLogo from '@/assets/connector/status.svg';
import trustwalletLogo from '@/assets/connector/trustwallet.svg';
import walletconnectLogo from '@/assets/connector/walletconnect.svg';
import walletlinkLogo from '@/assets/connector/walletlink.svg';
import i18n from './i18n';

const options: any = { connectors: [] };
const connectorClasses = {
  injected,
  fortmatic,
  torus,
  portis,
  walletconnect,
  walletlink
};

Object.entries(connectors).forEach((connector: any) => {
  options.connectors.push({
    key: connector[0],
    connector: connectorClasses[connector[0]],
    options: connector[1].options
  });
});

export function getConnectorName(connectorId: string): string {
  if (connectorId === 'injected') {
    const provider = window.ethereum as any;
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
    return i18n.global.t('browserWallet');
  }
  if (connectorId === 'fortmatic') {
    return 'Fortmatic';
  }
  if (connectorId === 'portis') {
    return 'Portis';
  }
  if (connectorId === 'walletconnect') {
    return 'WalletConnect';
  }
  if (connectorId === 'walletlink') {
    return `Coinbase ${i18n.global.t('wallet')}`;
  }
  return i18n.global.t('unknown');
}

export function getConnectorLogo(connectorId: string): string {
  if (connectorId === 'injected') {
    const provider = window.ethereum as any;
    if (provider.isMetaMask) {
      return metamaskLogo;
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
    return defaultLogo;
  }
  if (connectorId === 'fortmatic') {
    return fortmaticLogo;
  }
  if (connectorId === 'portis') {
    return portisLogo;
  }
  if (connectorId === 'walletconnect') {
    return walletconnectLogo;
  }
  if (connectorId === 'walletlink') {
    return walletlinkLogo;
  }
  return defaultLogo;
}

export default options;
