// eslint-disable-next-line no-restricted-imports
import { balancer } from '@/lib/balancer.sdk';
import { handleDependencyError } from '.';

// Initializing this heavy dependency by default we avoid calling initBalancerSDK in initDependencies from main.ts
// so that we avoid including in in the initial bundle
// as it is only imported when used via getBalancerSDK
let _balancer: typeof balancer = balancer;

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
