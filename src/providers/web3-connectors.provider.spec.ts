import { mountComposable } from '@tests/mount-helpers';
import { useWeb3Connectors } from './web3-connectors.provider';

// initDependenciesWithDefaultMocks();

async function mountWeb3ConnectorsProvider() {
  const { result } = mountComposable(() => useWeb3Connectors());

  const { account, chainId, isBlocked } = result;

  // expect(lockQuery.isLoading.value).toBeTrue();

  // await waitForExpect(() => {
  //   expect(lockQuery.isLoading.value).toBeFalse();
  // });

  return result;
}

test('Returns TBD', async () => {
  const { account, chainId, isBlocked } = await mountWeb3ConnectorsProvider();

  expect(account.value).toBe('');
});
