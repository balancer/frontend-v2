import { reactive, Ref, ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { TokenPrices } from '@/services/coingecko/api/price.service';

import useNetwork from '../useNetwork';
import { getBalancer } from '@/dependencies/balancer-sdk';

/**
 * TYPES
 */
type QueryResponse = TokenPrices;
type QueryOptions = UseQueryOptions<QueryResponse>;

/**
 * Fetches token prices for all provided addresses.
 */
export default function useTokenPricesQuery(
  addresses: Ref<string[]> = ref([]),
  pricesToInject: Ref<TokenPrices> = ref({}),
  enabled: Ref<boolean> = ref(false),
  options: QueryOptions = {}
) {
  const { networkId } = useNetwork();
  const queryKey = reactive(
    QUERY_KEYS.Tokens.Prices(networkId, addresses, pricesToInject)
  );

  function injectCustomTokens(
    prices: TokenPrices,
    pricesToInject: TokenPrices
  ): TokenPrices {
    for (const address of Object.keys(pricesToInject)) {
      prices[address] = pricesToInject[address];
    }
    return prices;
  }

  const balancer = getBalancer();
  const queryFn = async () => {
    const priceData = await Promise.all(
      addresses.value.map(a => balancer.data.tokenPrices.find(a))
    );

    let prices = addresses.value.reduce(
      (obj, key, index) => ({
        ...obj,
        [key]: priceData[index],
      }),
      {}
    );

    prices = injectCustomTokens(prices, pricesToInject.value);
    console.log('Fetching', Object.values(prices).length, 'prices');
    return prices;
  };

  const queryOptions = reactive({
    enabled,
    ...options,
  });

  return useQuery<QueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
