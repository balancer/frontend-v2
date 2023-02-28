import { initBalancer } from './balancer-sdk';
import { initEthersContract } from './EthersContract';
import { initMulticaller } from './Multicaller';
import { initMulticall } from './multicall';
import { initOldMulticaller } from './OldMulticaller';
import { initRpcProviderService } from './rpc-provider.service';

export function initDependencies() {
  // initBalancer(); // Adds 1.26MB of balancer-labs
  // initMulticaller(); //100KB
  // initEthersContract(); // Adds 100KB with bn.js (imported by ethereum-abi)
  // initRpcProviderService(); // ??Adds 100KB with bn.js (imported by ethereum-abi)
  initMulticall();
  initOldMulticaller();
}

export function handleDependencyError(dependencyName: string): never {
  const errorMessage = `${dependencyName} dependency was not initialized`;
  // We add the console.trace because sometimes we silence the exception when handling errors (e.g. use query error handling)
  console.trace(errorMessage);
  throw new Error(errorMessage);
}
