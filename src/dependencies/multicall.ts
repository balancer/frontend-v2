import { multicall } from '@/lib/utils/balancer/contract';
import { handleDependencyError } from '.';

let _multicall: typeof multicall | undefined;

/**
 * initMulticall uses the real multicall instance by default but allows injecting multicall mocks from tests
 */
export function initMulticall(multicallInstance: typeof multicall = multicall) {
  _multicall = multicallInstance;
}

export function getMulticall() {
  if (!_multicall) {
    handleDependencyError('Multicall');
  }
  return _multicall;
}
