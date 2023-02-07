// eslint-disable-next-line no-restricted-imports
import { balancer } from '@/lib/balancer.sdk';
import { handleDependencyError } from '.';

let _balancer: typeof balancer | undefined;

/**
 * Uses the real balancer instance by default but allows injecting balancer mocks from tests
 */
export function initBalancer(balancerInstance: typeof balancer = balancer) {
  _balancer = balancerInstance;
}

export function getBalancer() {
  if (!_balancer) {
    handleDependencyError('balancer');
  }
  return _balancer;
}
