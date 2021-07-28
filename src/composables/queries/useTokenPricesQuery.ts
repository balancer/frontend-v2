import { reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { sleep } from '@/lib/utils';

// TYPES
type Response = TokenPrices;

const perPage = 1000;

export default function useTokenPricesQuery(
  addresses: Ref<string[]> = ref([]),
  options: UseQueryOptions<Response> = {}
) {
  const queryKey = reactive(QUERY_KEYS.Tokens.Prices(addresses));

  const queryFn = async () => {
    // Sequential pagination required to avoid coingecko rate limits.
    let prices: TokenPrices = {};
    const pageCount = Math.ceil(addresses.value.length / perPage);
    const pages = Array.from(Array(pageCount).keys());

    for (const page of pages) {
      if (page !== 0) await sleep(1000);
      const pageAddresses = addresses.value.slice(
        perPage * page,
        perPage * (page + 1)
      );
      console.log('Fetching', pageAddresses.length, 'prices');
      prices = {
        ...prices,
        ...(await coingeckoService.prices.getTokens(pageAddresses))
      };
    }
    console.log('prices', Object.keys(prices).length);
    return prices;
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
