import { initMulticallWithDefaultMocks } from '@/dependencies/multicall.mocks';
import { initRpcProviderServiceWithDefaultMocks } from '@/dependencies/rpc-provider.service.mocks';
import { initBalancerWithDefaultMocks } from './balancer-sdk.mocks';
import { initOldMulticallerWithDefaultMocks } from './OldMulticaller.mocks';
import { initEthersContractWithDefaultMocks } from './EthersContract.mocks';
import { initMulticallerWithDefaultMocks } from './Multicaller.mocks';
import { initWalletConnectorsWithDefaultMocks } from './wallets/default-mocks';

export function initDependenciesWithDefaultMocks() {
  initMulticallWithDefaultMocks();
  initBalancerWithDefaultMocks();
  initRpcProviderServiceWithDefaultMocks();
  //@ts-ignore
  initOldMulticallerWithDefaultMocks();
  initMulticallerWithDefaultMocks();
  initEthersContractWithDefaultMocks();
  initWalletConnectorsWithDefaultMocks();
}
