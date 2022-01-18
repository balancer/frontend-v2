import { reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { coingeckoService } from '@/services/coingecko/coingecko.service';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { sleep } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import useUserSettings from '@/composables/useUserSettings';
import { TOKENS } from '@/constants/tokens';
import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = TokenPrices;

/**
 * CONSTANTS
 */
const PER_PAGE = 1000;

/**
 * Fetches token prices for all provided addresses.
 */
export default function useTokenPricesQuery(
  addresses: Ref<string[]> = ref([]),
  pricesToInject: Ref<Record<string, number>> = ref({}),
  options: UseQueryOptions<QueryResponse> = {}
) {
  const { networkId } = useNetwork();
  const queryKey = reactive(
    QUERY_KEYS.Tokens.Prices(networkId, addresses, pricesToInject)
  );
  const { currency } = useUserSettings();

  // TODO: kill this with fire as soon as Coingecko supports wstETH
  function injectWstEth(prices: TokenPrices): TokenPrices {
    const stEthAddress = configService.network.addresses.stETH;
    const wstEthAddress = configService.network.addresses.wstETH;
    if (prices[stEthAddress]) {
      const stETHPrice = prices[stEthAddress][currency.value] || 0;
      prices[wstEthAddress] = {
        [currency.value]: TOKENS.Prices.ExchangeRates.wstETH.stETH * stETHPrice
      };
    }

    return prices;
  }

  function injectCustomTokens(
    prices: TokenPrices,
    pricesToInject: Record<string, number>
  ): TokenPrices {
    for (const address of Object.keys(pricesToInject)) {
      prices[address] = {
        [currency.value]: pricesToInject[address]
      };
    }
    return prices;
  }

  const queryFn = async () => {
    // Sequential pagination required to avoid coingecko rate limits.
    let prices: TokenPrices = {};
    const pageCount = Math.ceil(addresses.value.length / PER_PAGE);
    const pages = Array.from(Array(pageCount).keys());

    for (const page of pages) {
      if (page !== 0) await sleep(1000);
      const pageAddresses = addresses.value.slice(
        PER_PAGE * page,
        PER_PAGE * (page + 1)
      );
      console.log('Fetching', pageAddresses.length, 'prices');
      prices = {
        ...prices,
        ...(await coingeckoService.prices.getTokens(pageAddresses))
      };
    }

    prices = injectWstEth(prices);
    console.log('Injecting price data', pricesToInject.value);
    prices = injectCustomTokens(prices, pricesToInject.value);
    return prices;
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
