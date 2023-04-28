// eslint-disable-next-line no-restricted-imports
import { PoolsFallbackRepository } from '@balancer-labs/sdk';
import { handleDependencyError } from '.';

let _repository: typeof PoolsFallbackRepository | undefined;

/**
 * Uses the real PoolsFallbackRepository instance by default but allows injecting PoolsFallbackRepository mocks from tests
 */
export function initPoolsFallbackRepository(
  repository: typeof PoolsFallbackRepository = PoolsFallbackRepository
) {
  _repository = repository;
}

export type PoolsFallBackFactoryConstructor = PoolsFallbackRepository;

export function getPoolsFallbackRepository() {
  if (!_repository) {
    handleDependencyError('PoolsFallbackRepository');
  }
  return _repository;
}
