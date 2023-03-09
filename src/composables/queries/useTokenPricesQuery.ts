import { reactive, Ref, ref } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';
import QUERY_KEYS from '@/constants/queryKeys';
import useNetwork from '../useNetwork';
import { api } from '@/services/api/api.client';
import { GqlTokenPrice } from '@/services/api/graphql/generated/api-types';

/**
 * TYPES
 */
export type TokenPrices = { [address: string]: number };
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

  function priceArrayToMap(prices: GqlTokenPrice[]): TokenPrices {
    return prices.reduce(
      (obj, item) => ((obj[item.address] = item.price), obj),
      {}
    );
  }

  function injectCustomTokens(
    prices: TokenPrices,
    pricesToInject: TokenPrices
  ): TokenPrices {
    for (const address of Object.keys(pricesToInject)) {
      prices[address] = pricesToInject[address];
    }
    return prices;
  }

  const queryFn = async () => {
    const { prices } = await api.GetCurrentTokenPrices();

    let pricesMap = priceArrayToMap(prices);
    pricesMap = injectCustomTokens(pricesMap, pricesToInject.value);
    console.log('Fetching', Object.values(prices).length, 'prices');

    return pricesMap;
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
