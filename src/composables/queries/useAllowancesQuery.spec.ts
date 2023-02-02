import { initMulticall } from '@/dependencies/multicall';
import { generateMulticallMock } from '@/dependencies/multicall.mocks';
import { TokenInfoMap } from '@/types/TokenList';
import { aTokenInfo } from '@/types/TokenList.builders';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';
import { Ref, ref } from 'vue';
import useAllowancesQuery from './useAllowancesQuery';

test('Returns token allowances from balancer SDK', async () => {
  const zeroAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const daiAddress = '0x8c9e6c40d3402480ACE624730524fACC5482798c';
  const balAddress = '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47';

  const tokens: Ref<TokenInfoMap> = ref({
    [zeroAddress]: aTokenInfo(zeroAddress),
    [daiAddress]: aTokenInfo(daiAddress),
    [balAddress]: aTokenInfo(balAddress),
  });

  function processCall(call) {
    const tokenAddress = call[0];
    const callType = call[1];
    const contractAddress = call[2][1];
    if (callType === 'allowance') {
      if (
        tokenAddress === balAddress &&
        contractAddress === '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF'
      )
        return 123456789;
    }
    // Default allowance value
    return 0;
  }

  initMulticall(generateMulticallMock(processCall));

  const allowanceContracts = ref([
    '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    '0x6320cD32aA674d2898A68ec82e869385Fc5f7E2f',
    '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
  ]);

  const { result } = mountComposable(() =>
    useAllowancesQuery(tokens, allowanceContracts)
  );

  const data = await waitForQueryData(result);

  expect(data).toMatchInlineSnapshot(`
    {
      "0x33A99Dcc4C85C014cf12626959111D5898bbCAbF": {
        "0x8c9e6c40d3402480ACE624730524fACC5482798c": "0.0",
        "0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47": "0.000000000123456789",
      },
      "0x6320cD32aA674d2898A68ec82e869385Fc5f7E2f": {
        "0x8c9e6c40d3402480ACE624730524fACC5482798c": "0.0",
        "0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47": "0.0",
      },
      "0xBA12222222228d8Ba445958a75a0704d566BF2C8": {
        "0x8c9e6c40d3402480ACE624730524fACC5482798c": "0.0",
        "0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47": "0.0",
      },
    }
  `);
});
