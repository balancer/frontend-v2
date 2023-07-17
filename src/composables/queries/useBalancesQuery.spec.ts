import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';

import { aTokenInfo } from '@/types/TokenList.builders';
import { ref } from 'vue';
import useBalancesQuery from './useBalancesQuery';
import { daiAddress, nativeAssetAddress } from '@tests/unit/builders/address';

initDependenciesWithDefaultMocks();

test('Returns token balances', async () => {
  const tokens = ref({
    [nativeAssetAddress]: aTokenInfo({ address: nativeAssetAddress }),
    [daiAddress]: aTokenInfo({ address: daiAddress }),
  });

  const { result } = mountComposable(() => useBalancesQuery({ tokens }));

  const data = await waitForQueryData(result);

  expect(data).toMatchInlineSnapshot(`
    {
      "0x8c9e6c40d3402480ACE624730524fACC5482798c": "0.000000000000000025",
      "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE": "0.0",
    }
  `);
});
