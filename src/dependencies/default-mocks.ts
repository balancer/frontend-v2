import { initMulticallWithDefaultMocks } from '@/dependencies/multicall.mocks';
import { initRpcProviderServiceWithDefaultMocks } from '@/dependencies/rpc-provider.service.mocks';
import { initBalancerSdkWithDefaultMocks } from './balancer-sdk.mocks';
import { initOldMulticallerWithDefaultMocks } from './OldMulticaller.mocks';
import { initEthersContractWithDefaultMocks } from './EthersContract.mocks';
import { initMulticallerWithDefaultMocks } from './Multicaller.mocks';
import { initWalletConnectorsWithDefaultMocks } from './wallets/default-mocks';
import { initBalancerApiWithDefaultMocks } from './balancer-api.mocks';
import { initPoolsFallbackRepositoryWithDefaultMocks } from './PoolsFallbackRepository.mocks';
import { initContractConcernWithDefaultMocks } from './contract.concern.mocks';
import { initRelayerWithDefaultMocks } from './Relayer.mocks';

export function initDependenciesWithDefaultMocks() {
  initMulticallWithDefaultMocks();
  initBalancerApiWithDefaultMocks();
  initBalancerSdkWithDefaultMocks();
  initRpcProviderServiceWithDefaultMocks();
  initOldMulticallerWithDefaultMocks();
  initMulticallerWithDefaultMocks();
  initEthersContractWithDefaultMocks();
  initWalletConnectorsWithDefaultMocks();
  initPoolsFallbackRepositoryWithDefaultMocks();
  initContractConcernWithDefaultMocks();
  initRelayerWithDefaultMocks();
}
