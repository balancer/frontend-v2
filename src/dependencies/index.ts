import { initBalancer } from './balancer-sdk';
import { initEthersContract } from './EthersContract';
import { initMulticall } from './multicall';
import { initMulticaller } from './Multicaller';
import { initRpcProviderService } from './rpc-provider.service';

export function initDependencies() {
  initMulticall();
  initBalancer();
  initRpcProviderService();
  initMulticaller();
  initEthersContract();
}

export function handleDependencyError(dependencyName: string): never {
  const errorMessage = `${dependencyName} dependency was not initialized`;
  // We add the console.trace because sometimes we silence the exception when handling errors (e.g. use query error handling)
  console.trace(errorMessage);
  throw new Error(errorMessage);
}
