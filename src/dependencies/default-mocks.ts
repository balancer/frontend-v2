import { initMulticallWithDefaultMocks } from '@/dependencies/multicall.mocks';
import { initRpcProviderServiceWithDefaultMocks } from '@/dependencies/rpc-provider.service.mocks';
import { initBalancerWithDefaultMocks } from './balancer-sdk.mocks';
import { initMulticallerWithDefaultMocks } from './Multicaller.mocks';
import { initEthersContractWithDefaultMocks } from './EthersContract.mocks';

export function initDependenciesWithDefaultMocks() {
  initMulticallWithDefaultMocks();
  initBalancerWithDefaultMocks();
  initRpcProviderServiceWithDefaultMocks();
  //@ts-ignore
  initMulticallerWithDefaultMocks();
  initEthersContractWithDefaultMocks();
}
