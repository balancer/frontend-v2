import { handleDependencyError } from '..';

let _walletConnectConnector;

/**
 * Uses the real walletconnect connector instance by default but allows injecting walletconnect connector mocks from tests
 */
export async function initWalletConnectConnector() {
  if (!_walletConnectConnector) {
    // Lazy load dependency to reduce initial bundle size
    const { WalletConnectConnector } = await import(
      '@/services/web3/connectors/trustwallet/walletconnect.connector'
    );
    _walletConnectConnector = WalletConnectConnector;
  }
}

export async function initWalletConnectConnectorForTesting(
  walletConnectConnector
) {
  _walletConnectConnector = walletConnectConnector;
}

export function getWalletConnectConnector() {
  if (!_walletConnectConnector) {
    handleDependencyError('WalletConnectConnector');
  }
  return _walletConnectConnector;
}
