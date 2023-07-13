// eslint-disable-next-line no-restricted-imports
import { PoolsFallbackRepository } from '@sobal/sdk';
import { handleDependencyError } from '.';

// Initializing this heavy dependency by default we avoid calling initPoolsFallbackRepository in initDependencies from main.ts
// so that we avoid including in in the initial bundle
// as it is only imported when used via getPoolsFallbackRepository
let _repository: typeof PoolsFallbackRepository = PoolsFallbackRepository;

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
