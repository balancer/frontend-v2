import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposable } from '@tests/mount-helpers';
import waitForExpect from 'wait-for-expect';
import { userDataProvider } from './user-data.provider';

initDependenciesWithDefaultMocks();

async function mountUserDataProvider() {
  const { result } = mountComposable(() => userDataProvider());

  const { lockQuery } = result;

  expect(lockQuery.isLoading.value).toBeTrue();

  await waitForExpect(() => {
    expect(lockQuery.isLoading.value).toBeFalse();
  });

  return result;
}

test('Returns valid lock data', async () => {
  const { lockQuery } = await mountUserDataProvider();

  expect(lockQuery.data.value?.hasExistingLock).toBeTrue();
  expect(lockQuery.data.value?.isExpired).toBeFalse();
});
