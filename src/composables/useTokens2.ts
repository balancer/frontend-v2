import { ref, Ref, computed } from 'vue';
import useTokenLists2 from './useTokenLists2';
import { isAddress, getAddress } from '@ethersproject/address';
import { TokenInfoMap } from '@/types/TokenList';
import useConfig from './useConfig';
import { tokenService } from '@/services/token/token.service';
import useTokenPricesQuery from './queries/useTokenPricesQuery';
import useAccountBalancesQuery from './queries/useAccountBalancesQuery';
import useAccountAllowancesQuery from './queries/useAccountAllowancesQuery';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';

/** TYPES */
interface UseTokenOpts {
  allowanceContracts?: string[];
  excludeTokens?: string[];
}

/* COMPOSABLES */
const { networkConfig } = useConfig();
const {
  loading: loadingTokenLists,
  failed: tokenListsFailed,
  defaultTokenList,
  allTokenLists
} = useTokenLists2();

/* STATE */
const injectedTokens = ref<TokenInfoMap>({});
const allowanceContracts = ref<string[]>([]);

/* INIT STATE */
allowanceContracts.value.push(networkConfig.addresses.vault);

/**
 * useTokens Composable
 * Interface to all token static and dynamic metatdata.
 */
export default function useTokens2(opts: UseTokenOpts = {}) {
  if (opts.allowanceContracts) {
    opts.allowanceContracts.forEach(address => addAllowanceContract(address));
  }

  /**
   * Static metadata
   *
   * The baseTokens, injectedTokens and allTokens dictionaries
   * provide the static metadata for each token.
   */
  const baseTokens = computed(
    (): TokenInfoMap => {
      if (loadingTokenLists.value || tokenListsFailed.value) return {};

      const baseTokens = {};

      defaultTokenList.value.tokens.forEach(token => {
        const address: string = getAddress(token.address);
        // Don't include if already included
        if (Object.keys(baseTokens).includes(address)) return;
        // Don't include if not on app network
        if (token.chainId !== networkConfig.chainId) return;

        baseTokens[address] = {
          ...token,
          address
        };
      });

      return baseTokens;
    }
  );

  const ether = computed(
    (): TokenInfoMap => {
      return {
        [networkConfig.nativeAsset.address]: {
          ...networkConfig.nativeAsset,
          chainId: networkConfig.chainId
        }
      };
    }
  );

  const allTokens = computed(
    (): TokenInfoMap => {
      const allTokens = {
        ...baseTokens.value,
        ...injectedTokens.value
      };
      return removeExcluded(allTokens);
    }
  );

  const allTokenAddresses = computed(() => Object.keys(allTokens.value));

  /**
   * Dynamic metadata
   *
   * The prices, balances and allowances maps provide dynamic
   * metadata for each token in allTokens.
   *
   * Queries need to be initated on component level to have access
   * to vueQuery instance.
   */
  const pricesQuery = useTokenPricesQuery(allTokenAddresses);
  const accountBalancesQuery = useAccountBalancesQuery(allTokenAddresses);
  const accountAllowancesQuery = useAccountAllowancesQuery(
    allTokenAddresses,
    allowanceContracts
  );

  const prices = computed(
    (): TokenPrices => (pricesQuery.data.value ? pricesQuery.data.value : {})
  );
  const balances = computed(
    (): BalanceMap =>
      accountBalancesQuery.data.value ? accountBalancesQuery.data.value : {}
  );
  const allowances = computed(
    (): ContractAllowancesMap =>
      accountAllowancesQuery.data.value ? accountAllowancesQuery.data.value : {}
  );

  /**
   * @function injectTokens
   * Fetches static token metadata for given addresses and injects
   * tokens into injected tokens map.
   *
   * Dynamic metadata fetching for given addresses will be triggered
   * when the injected tokens map is updated, via the relevant vueQueries.
   */
  async function injectTokens(addresses: string[]): Promise<void> {
    const tokens = await tokenService.metadata.get(
      addresses,
      allTokenLists.value
    );
    injectedTokens.value = { ...injectedTokens.value, ...tokens };
  }

  /**
   * @function addAllowanceContract
   * Adds contract address to array of contract addresses used to
   * track ERC20 allowances.
   */
  function addAllowanceContract(address: string): void {
    if (!allowanceContracts.value.includes(address)) {
      allowanceContracts.value.push(address);
    }
  }

  /**
   * @function searchTokens
   * Given query, filters allTokens map by name, symbol or address.
   */
  function searchTokens(query: string): TokenInfoMap {
    if (!query) return allTokens.value;

    if (isAddress(query)) {
      const address = getAddress(query);
      const token = allTokens.value[address];
      return token ? { [address]: token } : {};
    } else {
      const tokensArray = Object.entries(allTokens.value);
      const results = tokensArray.filter(
        ([, token]) =>
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol.toLowerCase().includes(query.toLowerCase())
      );
      return Object.fromEntries(results);
    }
  }

  /**
   * @function removeExcluded
   * Remove excluded tokens from given token map.
   */
  function removeExcluded(tokens: TokenInfoMap): TokenInfoMap {
    if (!opts.excludeTokens) return tokens;

    return Object.keys(tokens)
      .filter(address => !opts.excludeTokens?.includes(address))
      .reduce((result, address) => {
        result[address] = tokens[address];
        return result;
      }, {});
  }

  return {
    // computed
    allTokens,
    ether,
    prices,
    balances,
    allowances,
    // methods
    injectTokens,
    addAllowanceContract,
    searchTokens
  };
}
