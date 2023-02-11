// eslint-disable-next-line no-restricted-imports
import { handleDependencyError } from '.';

let _balancer;

/**
 * Uses the real balancer instance by default but allows injecting balancer mocks from tests
 */
export function initBalancer() {
  _balancer = { foo: 'bar' };
}

export function getBalancer() {
  return _balancer;
}
