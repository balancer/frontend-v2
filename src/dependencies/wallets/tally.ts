import { handleDependencyError } from '..';

let _tallyConnector;

/**
 * Uses the real tally connector instance by default but allows injecting tally connector mocks from tests
 */
export async function initTallyConnector() {
  if (!_tallyConnector) {
    // Lazy load dependency to reduce initial bundle size
    const { TallyConnector } = await import(
      '@/services/web3/connectors/tally/tally.connector'
    );
    _tallyConnector = TallyConnector;
  }
}

export async function initTallyConnectorForTesting(metamaskConnector) {
  _tallyConnector = metamaskConnector;
}

export function getTallyConnector() {
  if (!_tallyConnector) {
    handleDependencyError('TallyConnector');
  }
  return _tallyConnector;
}
