import {
  provideUserSettings,
  UserSettingsResponse,
} from '@/providers/user-settings.provider';
/* eslint-disable @typescript-eslint/no-unused-vars */

import { TokenPrices } from '@/composables/queries/useTokenPricesQuery';
import { initBalancerApiWithDefaultMocks } from '@/dependencies/balancer-api.mocks';
import { initMulticallWithDefaultMocks } from '@/dependencies/multicall.mocks';
import { initOldMulticallerWithDefaultMocks } from '@/dependencies/OldMulticaller.mocks';
import { safeInject } from '@/providers/inject';
import {
  provideTokenLists,
  TokenListsResponse,
} from '@/providers/token-lists.provider';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { TokenInfoMap } from '@/types/TokenList';
import {
  tokensProvider as originalTokensProvider,
  TokensProviderSymbol,
  TokensResponse,
} from '../tokens.provider';
import { silenceConsoleLog } from '@tests/unit/console';
import { groAddress, wethAddress } from '@tests/unit/builders/address';
import { initRpcProviderServiceWithDefaultMocks } from '@/dependencies/rpc-provider.service.mocks';
import { DeepPartial } from '@tests/unit/types';

initBalancerApiWithDefaultMocks();
initOldMulticallerWithDefaultMocks();
initMulticallWithDefaultMocks();
initRpcProviderServiceWithDefaultMocks();

silenceConsoleLog(vi, message => message.startsWith('Fetching'));

/**
 * TYPES
 */
export interface TokensProviderState {
  loading: boolean;
  injectedTokens: TokenInfoMap;
  spenders: string[];
  injectedPrices: TokenPrices;
}

export const defaultTokenPrice = 2;
export const defaultTokenBalance = '10';
export const defaultTokenMaxBalance = '20';

export const fakePriceMap: TokenPrices = {
  [groAddress]: defaultTokenPrice,
  [wethAddress]: defaultTokenPrice,
};

export const fakeBalanceMap: BalanceMap = {
  [groAddress]: defaultTokenBalance,
  [wethAddress]: defaultTokenBalance,
};

/**
 * Fake provider to be used by tests.
 * It behaves like the original tokens provider but it avoids network calls
 * It can be customized with override parameter
 */
export const customFakeTokensProvider = (
  override: DeepPartial<TokensResponse>
) => fakeTokensProvider(provideUserSettings(), provideTokenLists(), override);

/**
 * Fake provider to be used by tests.
 * It behaves like the original tokens provider but it avoids network calls
 * It can be customized with override parameter
 */
export const fakeTokensProvider = (
  userSettings: UserSettingsResponse = provideUserSettings(),
  tokenLists: TokenListsResponse = provideTokenLists(),
  override: DeepPartial<TokensResponse> = {}
): TokensResponse => {
  /**
   * Fake implementations to simplify testing setup
   */
  const prices = computed((): TokenPrices => fakePriceMap);
  const balances = computed((): BalanceMap => fakeBalanceMap);
  const allowances = computed((): ContractAllowancesMap => ({}));

  const dynamicDataLoaded = computed(() => true);
  const dynamicDataLoading = computed(() => false);

  /**
   * METHODS
   */
  async function injectSpenders(addresses: string[]): Promise<void> {
    //TODO: add logic test scenarios using spenders in a more realistic way
    return Promise.resolve();
  }

  /**
   * Fetch price for a token
   */
  function priceFor(address: string): number {
    return defaultTokenPrice;
  }

  /**
   * Fetch balance for a token
   */
  function balanceFor(address: string): string {
    return defaultTokenBalance;
  }

  /**
   * Get max balance of token
   * @param tokenAddress
   * @param disableNativeAssetBuffer Optionally disable native asset buffer
   */
  function getMaxBalanceFor(
    tokenAddress,
    disableNativeAssetBuffer = false
  ): string {
    return defaultTokenMaxBalance;
  }
  /**
   * Checks if token has a balance
   */
  function hasBalance(address: string): boolean {
    return Number(balances.value[address]) > 0;
  }

  const balanceQueryLoading = ref(false);
  const priceQueryLoading = ref(false);
  const priceQueryError = ref(false);
  const balancesQueryError = ref(false);
  const allowancesQueryError = ref(false);
  const refetchPrices = vi.fn();
  const refetchBalances = vi.fn();
  const refetchAllowances = vi.fn();

  const fakeResponse: DeepPartial<TokensResponse> = {
    // computed
    prices,
    balances,
    allowances,
    balanceQueryLoading,
    dynamicDataLoaded,
    dynamicDataLoading,
    priceQueryError,
    priceQueryLoading,
    balancesQueryError,
    allowancesQueryError,
    // methods
    refetchPrices,
    refetchBalances,
    refetchAllowances,
    hasBalance,
    injectSpenders,
    priceFor,
    balanceFor,
    getMaxBalanceFor,
  };

  const originalResponse = originalTokensProvider(userSettings, tokenLists);

  return {
    // By default we inherit the original tokens.provider behavior
    ...originalResponse,
    // But some functions are re-implemented by the fake to simplify testing
    ...fakeResponse,
    // And we also allow the user to override any function from tests
    ...override,
  } as TokensResponse;
};

export function provideTokens(
  userSettings: UserSettingsResponse,
  tokenLists: TokenListsResponse
) {
  const tokensResponse = fakeTokensProvider(userSettings, tokenLists);
  provide(TokensProviderSymbol, tokensResponse);
  return tokensResponse;
}

export const useTokens = (): TokensResponse => {
  return safeInject(TokensProviderSymbol);
};
