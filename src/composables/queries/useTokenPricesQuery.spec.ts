import {
  defaultTokenPrice,
  initBalancerWithDefaultMocks,
} from '@/dependencies/balancer-sdk.mocks';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';
import { daiAddress, tetherAddress } from '@tests/unit/builders/address';
import useTokenPricesQuery from './useTokenPricesQuery';

async function mountQuery(pricesToInject) {
  const { result } = mountComposable(() => useTokenPricesQuery(pricesToInject));
  const data = await waitForQueryData(result);
  return data;
}

test('Returns token prices from balancer SDK', async () => {
  const pricesToInject = ref({
    [tetherAddress]: defaultTokenPrice,
    [daiAddress]: defaultTokenPrice,
  });
  initBalancerWithDefaultMocks();

  const data = await mountQuery(pricesToInject);

  expect(data).toEqual({
    [tetherAddress]: defaultTokenPrice,
    [daiAddress]: defaultTokenPrice,
  });
});
