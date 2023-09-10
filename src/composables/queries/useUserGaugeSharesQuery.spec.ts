import useUserGaugeSharesQuery from '@/composables/queries/useUserGaugeSharesQuery';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import {
  defaultGaugeBalance,
  defaultPoolId,
  defaultTotalSupply,
} from '@/services/balancer/gauges/__mocks__/gauge-mocks';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';

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
        poolAddress: '0x0297e37f1873d2dab4487aa67cd56b58e2f27875',
        isPreferentialGauge: false,
        isKilled: false,
      },
    },
  ]);
});
