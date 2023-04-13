import { initApi } from './balancer-api';
import { initBalancer } from './balancer-sdk';
import { initEthersContract } from './EthersContract';
import { initMulticall } from './multicall';
import { initMulticaller } from './Multicaller';
import { initOldMulticaller } from './OldMulticaller';
import { initRpcProviderService } from './rpc-provider.service';
import { initWalletConnectors } from './wallets';
import { initWeb3Provider } from './wallets/Web3Provider';

export function initDependencies() {
  initMulticall();
  initApi();
  initBalancer();
  initRpcProviderService();
  initMulticaller();
  initOldMulticaller();
  initEthersContract();
  initWeb3Provider();
  initWalletConnectors();
}

export function handleDependencyError(dependencyName: string): never {
  const errorMessage = `${dependencyName} dependency was not initialized`;
  // We add the console.trace because sometimes we silence the exception when handling errors (e.g. use query error handling)
  console.trace(errorMessage);
  throw new Error(errorMessage);
}
