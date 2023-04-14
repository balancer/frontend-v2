import symbolKeys from '@/constants/symbol.keys';
import { bnum, includesAddress } from '@/lib/utils';
import { safeInject } from '../inject';
import { useTokens } from '../tokens.provider';

/**
 * Provides access to functionality related to tokens in a user's connected
 * wallet.
 */
export function userTokensProvider() {
  /**
   * COMPOSABLES
   */
  const {
    balances,
    balanceFor,
    balanceQueryLoading: isLoadingBalances,
  } = useTokens();

  /**
   * COMPUTED
   */
  // Array of token addresses that have a balance in the user's wallet.
  const tokensWithBalance = computed<string[]>(() => {
    return Object.keys(balances.value).filter(tokenAddress => {
      return bnum(balanceFor(tokenAddress)).gt(0);
    });
  });

  /**
   * METHODS
   */

  /**
   * Get subset of tokensWithBalance included in the provided array of addresses.
   *
   * @param {string[]} addresses Array of token addresses to filter by.
   * @returns Array of token addresses that are included in the provided array of addresses.
   */
  function tokensWithBalanceFrom(addresses: string[]): string[] {
    return addresses.filter(address =>
      includesAddress(tokensWithBalance.value, address)
    );
  }

  /**
   * Get subset of tokensWithBalance not included in the provided array of addresses.
   *
   * @param {string[]} addresses Array of token addresses to filter by.
   * @returns Array of token addresses that are not included in the provided array of addresses.
   */
  function tokensWithBalanceNotIn(addresses: string[]): string[] {
    return tokensWithBalance.value.filter(
      address => !includesAddress(addresses, address)
    );
  }

  /**
   * Get subset of provided addresses not included in the tokensWithBalance array.
   *
   * @param {string[]} addresses Array of token addresses to filter by.
   * @returns Array of token addresses without a balance in the user's wallet.
   */
  function tokensWithoutBalanceFrom(addresses: string[]): string[] {
    return addresses.filter(
      address => !includesAddress(tokensWithBalance.value, address)
    );
  }

  return {
    isLoadingBalances,
    tokensWithBalance,
    tokensWithBalanceFrom,
    tokensWithoutBalanceFrom,
    tokensWithBalanceNotIn,
  };
}

/**
 * Provider setup: response type + symbol.
 */
export type UserTokensProviderResponse = ReturnType<typeof userTokensProvider>;
export const UserTokensProviderSymbol: InjectionKey<UserTokensProviderResponse> =
  Symbol(symbolKeys.Providers.UserTokens);

export function provideUserTokens(): UserTokensProviderResponse {
  const _provider = userTokensProvider();
  provide(UserTokensProviderSymbol, _provider);
  return _provider;
}

export function useUserTokens(): UserTokensProviderResponse {
  return safeInject(UserTokensProviderSymbol);
}
