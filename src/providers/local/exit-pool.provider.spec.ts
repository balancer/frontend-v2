import { initBalancerSdkWithDefaultMocks } from '@/dependencies/balancer-sdk.mocks';
import { initEthersContractWithDefaultMocks } from '@/dependencies/EthersContract.mocks';
import { initRpcProviderServiceWithDefaultMocks } from '@/dependencies/rpc-provider.service.mocks';
import { hasFetchedPoolsForSor } from '@/lib/balancer.sdk';
import { Pool } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { groAddress, wethAddress } from '@tests/unit/builders/address';
import waitForExpect from 'wait-for-expect';
import { exitPoolProvider } from './exit-pool.provider';

initEthersContractWithDefaultMocks();
initBalancerSdkWithDefaultMocks();
initRpcProviderServiceWithDefaultMocks();

async function mountExitPoolProvider(pool: Pool) {
  const debounceQueryExitMillis = 10;
  const debounceGetSingleAssetMaxMillis = 10;
  const { result } = await mountComposable(() =>
    exitPoolProvider(
      ref(pool),
      debounceQueryExitMillis,
      debounceGetSingleAssetMaxMillis
    )
  );

  await waitForExpect(() => {
    expect(result.isLoadingQuery.value).toBeFalse();
  });

  return result;
}

test('exits a weighted pool with default exit handler (ExactOut)', async () => {
  // Pretend that pools for SOR were fetched
  hasFetchedPoolsForSor.value = true;

  const result = await mountExitPoolProvider(aWeightedPool());

  expect(result.amountsOut.value).toEqual([
    {
      address: groAddress,
      max: '',
      valid: true,
      value: '0',
    },
    {
      address: wethAddress,
      max: '',
      valid: true,
      value: '0',
    },
  ]);

  expect(result.approvalActions.value).toEqual([]);

  //TODO:finish test with proper assertions
  await result.exit();
});
