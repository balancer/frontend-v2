import { handleDependencyError } from '..';

let _safeConnector;

/**
 * Uses the real safe connector instance by default but allows injecting safe connector mocks from tests
 */
export async function initSafeConnector() {
  if (!_safeConnector) {
    // Lazy load dependency to reduce initial bundle size
    const { SafeConnector: SafeConnector } = await import(
      '@/services/web3/connectors/gnosis/gnosis.connector'
    );
    _safeConnector = SafeConnector;
  }
}

export async function initSafeConnectorForTesting(gnosisConnector) {
  _safeConnector = gnosisConnector;
}

export function getSafeConnector() {
  if (!_safeConnector) {
    handleDependencyError('SafeConnector');
  }
  return _safeConnector;
}
