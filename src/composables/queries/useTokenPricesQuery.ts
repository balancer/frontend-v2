import { reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { CoingeckoService } from '@/services/coingecko/coingecko.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';

// TYPES
type Response = TokenPrices;

// SERVICES
const coingeckoService = new CoingeckoService();

export default function useTokenPricesQuery(
  tokens: Ref<string[]> = ref([]),
  options: UseQueryOptions<Response> = {}
) {
  const queryKey = reactive(QUERY_KEYS.Tokens.Prices(tokens));

  const queryFn = async () => {
    return await coingeckoService.prices.getTokens(tokens.value);
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
