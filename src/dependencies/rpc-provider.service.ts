import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { handleDependencyError } from '.';
let _rpcProviderService = rpcProviderService;

/**
 * initRpcProviderService uses the real rpcProviderService instance by default but allows injecting rpcProviderService mocks from tests
 */
export function initRpcProviderService(
  rpcProviderServiceInstance: typeof rpcProviderService = rpcProviderService
) {
  _rpcProviderService = rpcProviderServiceInstance;
}

export function getRpcProviderService() {
  if (!_rpcProviderService) {
    handleDependencyError('rpc provider service');
  }
  return _rpcProviderService;
}
