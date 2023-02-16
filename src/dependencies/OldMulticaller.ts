// eslint-disable-next-line no-restricted-imports
import { Multicaller } from '@/lib/utils/balancer/contract';
import { handleDependencyError } from '.';

let _multicaller: typeof Multicaller | undefined;

/**
 * initMulticall uses the real multicall instance by default but allows injecting multicall mocks from tests
 */
export function initOldMulticaller(
  multicallerInstance: typeof Multicaller = Multicaller
) {
  _multicaller = multicallerInstance;
}

export function getOldMulticaller() {
  if (!_multicaller) {
    handleDependencyError('Old Multicaller');
  }
  return _multicaller;
}

export const OldMulticaller = Multicaller;
