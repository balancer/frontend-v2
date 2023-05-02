// eslint-disable-next-line no-restricted-imports
import { api } from '@/services/api/api.client';
import { handleDependencyError } from '.';

let _api: typeof api | undefined;

/**
 * Uses the real api instance by default but allows injecting api mocks from tests
 */
export function initApi(apiInstance: typeof api = api) {
  _api = apiInstance;
}

export function getApi() {
  if (!_api) {
    handleDependencyError('api');
  }
  return _api;
}
