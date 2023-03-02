import { handleDependencyError } from '..';

let _walletLinkConnector;

/**
 * Uses the real walletLink connector instance by default but allows injecting walletLink connector mocks from tests
 */
export async function initWalletLinkConnector() {
  if (!_walletLinkConnector) {
    // Lazy load dependency to reduce initial bundle size
    const { WalletLinkConnector } = await import(
      '@/services/web3/connectors/walletlink/walletlink.connector'
    );
    _walletLinkConnector = WalletLinkConnector;
  }
}

export async function initWalletLinkConnectorForTesting(walletLinkConnector) {
  _walletLinkConnector = walletLinkConnector;
}

export function getWalletLinkConnector() {
  if (!_walletLinkConnector) {
    handleDependencyError('WalletLinkConnector');
  }
  return _walletLinkConnector;
}
