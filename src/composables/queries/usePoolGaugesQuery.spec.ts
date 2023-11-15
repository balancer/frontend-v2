import { aWeightedPool } from '@/__mocks__/weighted-pool';
import usePoolGaugesQuery from '@/composables/queries/usePoolGaugesQuery';
import { defaultPreferentialGaugeAddress } from '@/services/balancer/gauges/__mocks__/gauge-mocks';
import {
  mountComposableWithDefaultTokensProvider as mountComposable,
  waitForQueryData,
} from '@tests/mount-helpers';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';

initDependenciesWithDefaultMocks();

test('Returns pool gauges', async () => {
  const pool = aWeightedPool();

  const { result } = mountComposable(() =>
    usePoolGaugesQuery(ref(pool.address))
  );

  const data = await waitForQueryData(result);

  expect(data?.pool.preferentialGauge.id).toEqual(
    defaultPreferentialGaugeAddress
  );
});
