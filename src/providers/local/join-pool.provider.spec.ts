import { initBalancerWithDefaultMocks } from '@/dependencies/balancer-sdk.mocks';
import { initEthersContractWithDefaultMocks } from '@/dependencies/EthersContract.mocks';
import { Pool } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { anAmountIn } from '@tests/unit/builders/pool.builders';
import { ref } from 'vue';
import waitForExpect from 'wait-for-expect';
import { joinPoolProvider } from './join-pool.provider';

initBalancerWithDefaultMocks();
initEthersContractWithDefaultMocks();

async function mountJoinPoolProvider(pool: Pool) {
  const { result } = await mountComposable(() => joinPoolProvider(ref(pool)));

  await waitForExpect(() => {
    expect(result.isLoadingQuery.value).toBeTrue();
  });
  await waitForExpect(() => {
    expect(result.isLoadingQuery.value).toBeFalse();
  });

  return result;
}

test('join a weighted pool', async () => {
  const result = await mountJoinPoolProvider(aWeightedPool());

  expect(result.amountsIn.value).toEqual([]);
  expect(result.approvalActions.value).toEqual([]);

  result.setAmountsIn([anAmountIn({ value: '23' })]);

  // This test will be finished once we merge test-swap-and-exact-exit-handlers PR (containing helpers)
  // await result.join();
});
