import { Relayer } from '@sobal/sdk';
import { handleDependencyError } from '.';

let _Relayer: typeof Relayer = Relayer;

/**
 * Uses the real Relayer instance by default but allows injecting Relayer mocks from tests
 */
export function initRelayer(RelayerInstance: typeof Relayer = Relayer) {
  _Relayer = RelayerInstance;
}

export function getRelayer() {
  if (!_Relayer) {
    handleDependencyError('Relayer');
  }
  return _Relayer;
}
