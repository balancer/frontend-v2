import { handleDependencyError } from '..';

let _gnosisConnector;

/**
 * Uses the real gnosis connector instance by default but allows injecting gnosis connector mocks from tests
 */
export async function initGnosisConnector() {
  if (!_gnosisConnector) {
    // Lazy load dependency to reduce initial bundle size
    const { GnosisSafeConnector } = await import(
      '@/services/web3/connectors/gnosis/gnosis.connector'
    );
    _gnosisConnector = GnosisSafeConnector;
  }
}

export async function initGnosisConnectorForTesting(gnosisConnector) {
  _gnosisConnector = gnosisConnector;
}

export function getGnosisConnector() {
  if (!_gnosisConnector) {
    handleDependencyError('GnosisConnector');
  }
  return _gnosisConnector;
}
