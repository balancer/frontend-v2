import { MetamaskConnector } from '@/services/web3/connectors/metamask/metamask.connector';
import { handleDependencyError } from '..';

let _metamaskConnector;

/**
 * Uses the real metamask connector instance by default but allows injecting metamask connector mocks from tests
 */
export async function initMetamaskConnector() {
  if (!_metamaskConnector) {
    // Lazy load dependency to reduce initial bundle size
    const { MetamaskConnector } = await import(
      '@/services/web3/connectors/metamask/metamask.connector'
    );
    _metamaskConnector = MetamaskConnector;
  }
}

export async function initMetamaskConnectorForTesting(metamaskConnector) {
  _metamaskConnector = metamaskConnector;
}

export function getMetamaskConnector(): MetamaskConnector {
  if (!_metamaskConnector) {
    handleDependencyError('MetamaskConnector');
  }
  return _metamaskConnector;
}
