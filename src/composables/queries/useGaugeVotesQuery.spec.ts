import useGaugeVotesQuery from '@/composables/queries/useGaugeVotesQuery';
import { initOldMulticallerWithDefaultMocks } from '@/dependencies/OldMulticaller.mocks';
import {
  mountComposableWithDefaultTokensProvider as mountComposable,
  waitForQueryData,
} from '@tests/mount-helpers';

initOldMulticallerWithDefaultMocks();

test('Returns gauges voting list decorated with user votes', async () => {
  const { result } = mountComposable(() => useGaugeVotesQuery());

  const data = await waitForQueryData(result);

  console.log('CO', data);
});
