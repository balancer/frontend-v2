import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';

import { aTokenInfo } from '@/types/TokenList.builders';
import { ref } from 'vue';
import useBalancesQuery from './useBalancesQuery';

initDependenciesWithDefaultMocks();

test('Returns token balances', async () => {
  const zeroAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const daiAddress = '0x8c9e6c40d3402480ACE624730524fACC5482798c';

  const tokens = ref({
    [zeroAddress]: aTokenInfo(zeroAddress),
    [daiAddress]: aTokenInfo(daiAddress),
  });

  const { result } = mountComposable(() =>
    useBalancesQuery(tokens, { keepPreviousData: true })
  );

  const data = await waitForQueryData(result);

  expect(data).toMatchInlineSnapshot(`
    {
      "0x8c9e6c40d3402480ACE624730524fACC5482798c": "0.000000000000000025",
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": "0.0",
    }
  `);
});
