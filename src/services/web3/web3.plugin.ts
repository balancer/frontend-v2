import { Network } from '@balancer-labs/sdk';
import { useI18n } from 'vue-i18n';

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

export type Wallet =
  | 'metamask'
  | 'walletconnect'
  | 'gnosis'
  | 'walletlink'
  | 'tally';

export const SupportedWallets = [
  'metamask',
  'walletconnect',
  'tally',
  'gnosis',
  'walletlink',
] as Wallet[];

export const WalletNameMap: Record<Wallet, string> = {
  metamask: 'Metamask',
  walletconnect: 'WalletConnect',
  gnosis: 'Gnosis Safe',
  walletlink: 'Coinbase Wallet',
  tally: 'Tally',
};

export const networkMap = {
  [Network.MAINNET]: 'mainnet',
  [Network.GOERLI]: 'goerli',
  [Network.POLYGON]: 'polygon',
  [Network.ARBITRUM]: 'arbitrum-one',
};

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
