import { handleDependencyError } from '..';

let _walletconnectConnector;

/**
 * Uses the real walletconnect connector instance by default but allows injecting walletconnect connector mocks from tests
 */
export async function initWalletconnectConnector() {
  if (!_walletconnectConnector) {
    // Lazy load dependency to reduce initial bundle size
    const { WalletConnectConnector } = await import(
      '@/services/web3/connectors/trustwallet/walletconnect.connector'
    );
    _walletconnectConnector = WalletConnectConnector;
  }
}

export async function initWalletconnectConnectorForTesting(
  walletconnectConnector
) {
  _walletconnectConnector = walletconnectConnector;
}

export function getWalletconnectConnector() {
  if (!_walletconnectConnector) {
    handleDependencyError('Walletconnect Connector');
  }
  return _walletconnectConnector;
}
