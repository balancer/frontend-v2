import useUserGaugeSharesQuery from '@/composables/queries/useUserGaugeSharesQuery';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';
import {
  defaultGaugeBalance,
  defaultPoolId,
  defaultTotalSupply,
} from '@tests/msw/graphql-handlers';

initDependenciesWithDefaultMocks();

test('Returns gauge shares for the current user', async () => {
  const { result } = mountComposable(() => useUserGaugeSharesQuery());

  const data = await waitForQueryData(result);

  expect(data).toEqual([
    {
      balance: defaultGaugeBalance,
      gauge: {
        id: 'gauge id',
        poolId: defaultPoolId,
        totalSupply: defaultTotalSupply,
      },
    },
  ]);
});
