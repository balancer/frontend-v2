import { initBalancer } from '@/dependencies/balancer-sdk';
import { BalancerSDK } from '@balancer-labs/sdk';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';
import { mockDeep } from 'vitest-mock-extended';
import { ref } from 'vue';
import useTokenPricesQuery from './useTokenPricesQuery';

test('Returns token prices from balancer SDK', async () => {
  const tokenAddresses = ref([
    '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE',
    '0x398106564948fEeb1fEdeA0709AE7D969D62a391',
  ]);

  const injectedPrices = ref({});
  const pricesQueryEnabled = ref(true);

  const mockedPrice = {
    usd: '1',
    eth: '0.005',
  };

  const balancerMock = mockDeep<BalancerSDK>();
  balancerMock.data.tokenPrices.find.mockResolvedValue(mockedPrice);
  initBalancer(balancerMock);

  const { result } = mountComposable(() =>
    useTokenPricesQuery(tokenAddresses, injectedPrices, pricesQueryEnabled, {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    })
  );

  const data = await waitForQueryData(result);

  expect(data).toMatchInlineSnapshot(`
      {
        "0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE": {
          "eth": "0.005",
          "usd": "1",
        },
        "0x398106564948fEeb1fEdeA0709AE7D969D62a391": {
          "eth": "0.005",
          "usd": "1",
        },
      }
    `);
});
