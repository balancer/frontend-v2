import { Multicaller } from '@/lib/utils/balancer/contract';
import { handleDependencyError } from '.';

let _multicaller: typeof Multicaller | undefined;

/**
 * initMulticall uses the real multicall instance by default but allows injecting multicall mocks from tests
 */
export function initMulticaller(
  multicallerInstance: typeof Multicaller = Multicaller
) {
  _multicaller = multicallerInstance;
}

export function getMulticaller() {
  if (!_multicaller) {
    handleDependencyError('Multicaller');
  }
  return _multicaller;
}
