import useUserPoolSharesQuery from '@/composables/queries/useUserPoolSharesQuery';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';
import { defaultPoolBalance } from '@tests/msw/graphql-handlers';

initDependenciesWithDefaultMocks();

test('Returns pool shares for the current user', async () => {
  const { result } = mountComposable(() => useUserPoolSharesQuery());

  const data = await waitForQueryData(result);

  expect(data).toEqual({
    '0xe053685f16968a350c8dea6420281a41f72ce3aa00020000000000000000006b':
      defaultPoolBalance,
  });
});
