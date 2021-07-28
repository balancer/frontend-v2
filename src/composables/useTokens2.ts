import { inject } from 'vue';
import { isAddress, getAddress } from '@ethersproject/address';
import { TokenInfoMap } from '@/types/TokenList';
import { tokenService } from '@/services/token/token.service';
import {
  TokensProviderResponse,
  TokensProviderSymbol
} from '@/providers/tokens2.provider';
import useTokenLists2 from './useTokenLists2';

/** TYPES */
interface UseTokenOpts {
  allowanceContracts?: string[];
}

const defaultProviderResponse = {} as TokensProviderResponse;

/**
 * useTokens Composable
 * Interface to all token static and dynamic metatdata.
 */
export default function useTokens2(opts: UseTokenOpts = {}) {
  /** SETUP */
  const {
    injectedTokens,
    allowanceContracts,
    nativeAsset,
    allTokens,
    prices,
    balances,
    allowances,
    dynamicDataSuccess,
    dynamicDataLoading
  } = inject(TokensProviderSymbol, defaultProviderResponse);

  if (opts.allowanceContracts) {
    opts.allowanceContracts.forEach(address => addAllowanceContract(address));
  }

  /** COMPOSABLES */
  const { allTokenLists } = useTokenLists2();

  /** METHODS */
  /**
   * Fetches static token metadata for given addresses and injects
   * tokens into injected tokens map.
   */
  async function injectTokens(addresses: string[]): Promise<TokenInfoMap> {
    // Only inject tokens that aren't already in allTokens
    addresses = addresses.filter(
      address => !Object.keys(allTokens.value).includes(address)
    );
    if (addresses.length === 0) return {};

    const tokens = await tokenService.metadata.get(
      addresses,
      allTokenLists.value
    );
    injectedTokens.value = { ...injectedTokens.value, ...tokens };

    return tokens;
  }

  /**
   * Adds contract address to array of contract addresses used to
   * track ERC20 allowances.
   */
  function addAllowanceContract(address: string): void {
    if (!allowanceContracts.value.includes(address)) {
      allowanceContracts.value.push(address);
    }
  }

  /**
   * Given query, filters allTokens map by name, symbol or address.
   * If address is provided, search for address in allTokens or injectToken
   */
  async function searchTokens(
    query: string,
    excluded: string[] = []
  ): Promise<TokenInfoMap> {
    if (!query) return removeExcluded(allTokens.value, excluded);

    if (isAddress(query)) {
      const address = getAddress(query);
      const token = allTokens.value[address];
      if (token) {
        return { [address]: token };
      } else {
        return await injectTokens([address]);
      }
    } else {
      const tokensArray = Object.entries(allTokens.value);
      const results = tokensArray.filter(
        ([, token]) =>
          token.name.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol.toLowerCase().includes(query.toLowerCase())
      );
      return removeExcluded(Object.fromEntries(results), excluded);
    }
  }

  /**
   * Remove excluded tokens from given token map.
   */
  function removeExcluded(
    tokens: TokenInfoMap,
    excluded: string[]
  ): TokenInfoMap {
    return Object.keys(tokens)
      .filter(address => !excluded.includes(address))
      .reduce((result, address) => {
        result[address] = tokens[address];
        return result;
      }, {});
  }

  /**
   * Checks if token has a balance
   */
  function hasBalance(address: string): boolean {
    return Number(balances.value[address]) > 0;
  }

  return {
    // state
    injectedTokens,
    allowanceContracts,
    // computed
    allTokens,
    nativeAsset,
    prices,
    balances,
    allowances,
    dynamicDataSuccess,
    dynamicDataLoading,
    // methods
    injectTokens,
    addAllowanceContract,
    searchTokens,
    hasBalance
  };
}
