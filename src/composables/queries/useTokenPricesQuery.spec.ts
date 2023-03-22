import {
  defaultTokenPrice,
  initBalancerWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';
import { daiAddress, tetherAddress } from '@tests/unit/builders/address';
import useTokenPricesQuery from './useTokenPricesQuery';

async function mountQuery(tokenAddresses) {
  const injectedPrices = ref({});
  const pricesQueryEnabled = ref(true);
  const { result } = mountComposable(() =>
    useTokenPricesQuery(tokenAddresses, injectedPrices, pricesQueryEnabled, {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    })
  );
  const data = await waitForQueryData(result);
  return data;
}

test('Returns token prices from balancer SDK', async () => {
  const tokenAddresses = ref([tetherAddress, daiAddress]);
  initBalancerWithDefaultMocks();

  const data = await mountQuery(tokenAddresses);

  expect(data).toEqual({
    [tetherAddress]: defaultTokenPrice,
    [daiAddress]: defaultTokenPrice,
  });
});
