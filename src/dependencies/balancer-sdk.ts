// eslint-disable-next-line no-restricted-imports
import { balancer } from '@/lib/balancer.sdk';
import { handleDependencyError } from '.';

let _balancer: typeof balancer | undefined;

/**
 * Uses the real balancer instance by default but allows injecting balancer mocks from tests
 */
export function initBalancerSDK(balancerInstance: typeof balancer = balancer) {
  _balancer = balancerInstance;
}

export function getBalancerSDK() {
  if (!_balancer) {
    handleDependencyError('balancer SDK');
  }
  return _balancer;
}
