import {
  defaultTokenPrice,
  initBalancerApiWithDefaultMocks,
} from '@/dependencies/balancer-api.mocks';
import { mountComposable, waitForQueryData } from '@tests/mount-helpers';
import { daiAddress, tetherAddress } from '@tests/unit/builders/address';
import useTokenPricesQuery from './useTokenPricesQuery';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';

initDependenciesWithDefaultMocks();

async function mountQuery(pricesToInject) {
  const { result } = mountComposable(() => useTokenPricesQuery(pricesToInject));
  const data = await waitForQueryData(result);
  return data;
}

test('Returns token prices from balancer API', async () => {
  const pricesToInject = ref({
    [tetherAddress]: defaultTokenPrice,
    [daiAddress]: defaultTokenPrice,
  });
  initBalancerApiWithDefaultMocks();

  const data = await mountQuery(pricesToInject);

  expect(data?.[tetherAddress]).toEqual(defaultTokenPrice);
  expect(data?.[daiAddress]).toEqual(defaultTokenPrice);
});
