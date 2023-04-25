import { initBalancerSdkWithDefaultMocks } from '@/dependencies/balancer-sdk.mocks';
import { Pool } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { mountComposable } from '@tests/mount-helpers';
import { ref } from 'vue';
import waitForExpect from 'wait-for-expect';
import { joinPoolProvider } from './join-pool.provider';

initBalancerSdkWithDefaultMocks();

vi.mock('@/providers/tokens.provider');

async function mountJoinPoolProvider(pool: Pool) {
  const { result } = mountComposable(() => joinPoolProvider(ref(pool)));

  await waitForExpect(() => {
    expect(result.isLoadingQuery.value).toBeTrue();
  });
  await waitForExpect(() => {
    expect(result.isLoadingQuery.value).toBeFalse();
  });

  return result;
}

// These tests are throwing an unhandled error:
// TODO: review that error when we decide to complete the suite
test('Throws error for weighted pools', async () => {
  let expectedError: Error = Error();
  try {
    await mountJoinPoolProvider(aWeightedPool());
  } catch (error) {
    if (error instanceof Error) expectedError = error;
  }

  expect(expectedError.message).toStartWith('Pool type not handled:');
});
