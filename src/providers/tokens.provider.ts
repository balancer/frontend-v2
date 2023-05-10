import { getAddress, isAddress } from '@ethersproject/address';
import { compact, omit, pick } from 'lodash';
import {
  computed,
  InjectionKey,
  nextTick,
  onBeforeMount,
  provide,
  reactive,
  toRef,
  toRefs,
} from 'vue';
import { captureException } from '@sentry/browser';

import useAllowancesQuery from '@/composables/queries/useAllowancesQuery';
import useBalancesQuery from '@/composables/queries/useBalancesQuery';
import useTokenPricesQuery, {
  TokenPrices,
} from '@/composables/queries/useTokenPricesQuery';
import useConfig from '@/composables/useConfig';
import symbolKeys from '@/constants/symbol.keys';
import { TOKENS } from '@/constants/tokens';
import {
  bnum,
  forChange,
  getAddressFromPoolId,
  includesAddress,
  isSameAddress,
  selectByAddressFast,
} from '@/lib/utils';
import { safeInject } from '@/providers/inject';
import { UserSettingsResponse } from '@/providers/user-settings.provider';
import { TokenListsResponse } from '@/providers/token-lists.provider';
import { configService } from '@/services/config/config.service';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import TokenService from '@/services/token/token.service';
import {
  NativeAsset,
  TokenInfo,
  TokenInfoMap,
  TokenListMap,
} from '@/types/TokenList';
import useWeb3 from '@/services/web3/useWeb3';
import { tokenListService } from '@/services/token-list/token-list.service';

const { uris: tokenListUris } = tokenListService;

/**
 * TYPES
 */
export interface TokensProviderState {
  loading: boolean;
  injectedTokens: TokenInfoMap;
  allowanceContracts: string[];
  injectedPrices: TokenPrices;
}

/**
 * Provides an interface to all token static and dynamic metadata.
 */
export const tokensProvider = (
  userSettings: UserSettingsResponse,
  tokenLists: TokenListsResponse
) => {
  /**
   * COMPOSABLES
   */
  const { networkConfig } = useConfig();
  const { isWalletReady } = useWeb3();
  const {
    tokensListPromise,
    allTokenLists,
    activeTokenLists,
    balancerTokenLists,
  } = tokenLists;

  /**
   * STATE
   */
  const nativeAsset: NativeAsset = {
    ...networkConfig.nativeAsset,
    chainId: networkConfig.chainId,
  };

  const state: TokensProviderState = reactive({
    loading: true,
    injectedTokens: {},
    allowanceContracts: compact([
      networkConfig.addresses.vault,
      networkConfig.addresses.wstETH,
      configService.network.addresses.veBAL,
    ]),
    injectedPrices: {},
  });

  /**
   * COMPUTED
   */

  /**
   * All tokens from all token lists.
   */
  const allTokenListTokens = computed(
    (): TokenInfoMap => ({
      [networkConfig.nativeAsset.address]: nativeAsset,
      ...mapTokenListTokens(allTokenLists.value),
      ...state.injectedTokens,
    })
  );

  /**
   * All tokens from token lists that are toggled on.
   */
  const activeTokenListTokens = computed(
    (): TokenInfoMap => mapTokenListTokens(activeTokenLists.value)
  );

  /**
   * All tokens from Balancer token lists, e.g. 'listed' and 'vetted'.
   */
  const balancerTokenListTokens = computed(
    (): TokenInfoMap => mapTokenListTokens(balancerTokenLists.value)
  );

  /**
   * The main tokens map
   * A combination of activated token list tokens
   * and any injected tokens. Static and dynamic
   * meta data should be available for these tokens.
   */
  const tokens = computed(
    (): TokenInfoMap => ({
      [networkConfig.nativeAsset.address]: nativeAsset,
      ...allTokenListTokens.value,
      ...state.injectedTokens,
    })
  );

  const wrappedNativeAsset = computed(
    (): TokenInfo => getToken(TOKENS.Addresses.wNativeAsset)
  );

  /****************************************************************
   * Dynamic metadata
   *
   * The prices, balances and allowances maps provide dynamic
   * metadata for each token in the tokens state array.
   ****************************************************************/
  const {
    data: priceData,
    isSuccess: priceQuerySuccess,
    isInitialLoading: priceQueryLoading,
    isRefetching: priceQueryRefetching,
    isError: priceQueryError,
    refetch: refetchPrices,
  } = useTokenPricesQuery(toRef(state, 'injectedPrices'));

  const {
    data: balanceData,
    isSuccess: balanceQuerySuccess,
    isInitialLoading: balanceQueryLoading,
    isRefetching: balanceQueryRefetching,
    isError: balancesQueryError,
    refetch: refetchBalances,
  } = useBalancesQuery(tokens);

  const {
    data: allowanceData,
    isSuccess: allowanceQuerySuccess,
    isInitialLoading: allowanceQueryLoading,
    isRefetching: allowanceQueryRefetching,
    isError: allowancesQueryError,
    refetch: refetchAllowances,
  } = useAllowancesQuery(tokens, toRef(state, 'allowanceContracts'));

  const prices = computed(
    (): TokenPrices => (priceData.value ? priceData.value : {})
  );
  const balances = computed(
    (): BalanceMap => (balanceData.value ? balanceData.value : {})
  );
  const allowances = computed(
    (): ContractAllowancesMap =>
      allowanceData.value ? allowanceData.value : {}
  );

  const onchainDataLoading = computed(
    (): boolean =>
      isWalletReady.value &&
      (balanceQueryLoading.value ||
        balanceQueryRefetching.value ||
        allowanceQueryLoading.value ||
        allowanceQueryRefetching.value)
  );

  const dynamicDataLoaded = computed(
    (): boolean =>
      priceQuerySuccess.value &&
      balanceQuerySuccess.value &&
      allowanceQuerySuccess.value
  );

  const dynamicDataLoading = computed(
    (): boolean =>
      priceQueryLoading.value ||
      priceQueryRefetching.value ||
      onchainDataLoading.value
  );

  /**
   * METHODS
   */
  /**
   * Create token map from a token list tokens array.const isEmpty = Object.keys(person).length === 0;
   */
  function mapTokenListTokens(tokenListMap: TokenListMap): TokenInfoMap {
    const isEmpty = Object.keys(tokenListMap).length === 0;
    if (isEmpty) return {};

    const tokens = [...Object.values(tokenListMap)]
      .map(list => list.tokens)
      .flat();

    const tokensMap = tokens.reduce<TokenInfoMap>((acc, token) => {
      const address: string = getAddress(token.address);

      // Don't include if already included
      if (acc[address]) return acc;

      // Don't include if not on app network
      if (token.chainId !== networkConfig.chainId) return acc;

      acc[address] = token;
      return acc;
    }, {});

    return tokensMap;
  }

  /**
   * Fetches static token metadata for given addresses and injects
   * tokens into state tokens map.
   */
  async function injectTokens(addresses: string[]): Promise<void> {
    addresses = addresses
      .filter(a => a)
      .map(getAddressFromPoolId)
      .map(getAddress);

    // Remove any duplicates
    addresses = [...new Set(addresses)];

    const existingAddresses = Object.keys(tokens.value);
    const existingAddressesMap = Object.fromEntries(
      existingAddresses.map((address: string) => [getAddress(address), true])
    );

    // Only inject tokens that aren't already in tokens
    const injectable = addresses.filter(
      address => !existingAddressesMap[address]
    );
    if (injectable.length === 0) return;

    //Wait for dynamic token list import to be resolved
    await tokensListPromise;

    const newTokens = await new TokenService().metadata.get(
      injectable,
      omit(allTokenLists.value, tokenListUris.Balancer.Default)
    );

    state.injectedTokens = { ...state.injectedTokens, ...newTokens };

    // Wait for balances/allowances to be fetched for newly injected tokens.
    await nextTick();
    await forChange(onchainDataLoading, false);
  }

  /**
   * Given query, filters tokens map by name, symbol or address.
   * If address is provided, search for address in tokens or injectToken
   */
  async function searchTokens(
    query: string,
    {
      excluded = [],
      disableInjection = false,
      subset = [],
    }: { excluded?: string[]; disableInjection?: boolean; subset?: string[] }
  ): Promise<TokenInfoMap> {
    let tokensToSearch = subset.length > 0 ? getTokens(subset) : tokens.value;
    if (!query) return removeExcluded(tokensToSearch, excluded);

    tokensToSearch =
      subset.length > 0 ? tokensToSearch : allTokenListTokens.value;

    const potentialAddress = getAddressFromPoolId(query);

    if (isAddress(potentialAddress)) {
      const address = getAddress(potentialAddress);
      const token = tokensToSearch[address];
      if (token) {
        return { [address]: token };
      } else {
        if (!disableInjection) {
          await injectTokens([address]);
          return pick(tokens.value, address);
        } else {
          return { [address]: token };
        }
      }
    } else {
      const tokensArray = Object.entries(tokensToSearch);
      const results = tokensArray.filter(
        ([, token]) =>
          token.name?.toLowerCase().includes(query.toLowerCase()) ||
          token.symbol?.toLowerCase().includes(query.toLowerCase())
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
      .filter(address => !includesAddress(excluded, address))
      .reduce((result, address) => {
        result[address] = tokens[address];
        return result;
      }, {});
  }

  /**
   * Check if approval is required for given contract address
   * for a token and amount.
   */
  function approvalRequired(
    tokenAddress: string,
    amount: string,
    contractAddress = networkConfig.addresses.vault
  ): boolean {
    if (!amount || bnum(amount).eq(0)) return false;
    if (!contractAddress) return false;
    if (isSameAddress(tokenAddress, nativeAsset.address)) return false;

    const allowance = bnum(
      (allowances.value[contractAddress] || {})[getAddress(tokenAddress)]
    );
    return allowance.lt(amount);
  }

  /**
   * Check which tokens require approvals for given amounts
   * @returns a subset of the token addresses passed in.
   */
  function approvalsRequired(
    tokenAddresses: string[],
    amounts: string[],
    contractAddress: string = networkConfig.addresses.vault
  ): string[] {
    return tokenAddresses.filter((address, index) => {
      if (!contractAddress) return false;

      return approvalRequired(address, amounts[index], contractAddress);
    });
  }

  /**
   * Fetch price for a token
   */
  function priceFor(address: string): number {
    try {
      const price = selectByAddressFast(prices.value, getAddress(address));
      if (!price) {
        captureException(new Error('Could not find price for token'), {
          level: 'info',
          extra: { address },
        });
        return 0;
      }
      return price;
    } catch {
      return 0;
    }
  }

  /**
   * Fetch balance for a token
   */
  function balanceFor(address: string): string {
    try {
      return selectByAddressFast(balances.value, getAddress(address)) || '0';
    } catch {
      return '0';
    }
  }

  /**
   * Checks if token has a balance
   */
  function hasBalance(address: string): boolean {
    return (
      Number(selectByAddressFast(balances.value, getAddress(address)) || '0') >
      0
    );
  }

  /**
   * Get subset of tokens from state
   */
  function getTokens(addresses: string[]): TokenInfoMap {
    return pick(tokens.value, addresses.map(getAddress));
  }

  /**
   * Get single token from state
   */
  function getToken(address: string): TokenInfo {
    address = getAddressFromPoolId(address); // In case pool ID has been passed
    return selectByAddressFast(tokens.value, getAddress(address)) as TokenInfo;
  }

  /**
   * Injects prices for tokens where the pricing provider
   * may have not found a valid price for provided tokens
   * @param pricesToInject A map of <address, price> to inject
   */
  function injectPrices(pricesToInject: TokenPrices) {
    state.injectedPrices = {
      ...state.injectedPrices,
      ...pricesToInject,
    };
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
    let maxAmount;
    const tokenBalance = balanceFor(tokenAddress) || '0';
    console.log({ tokenBalance });
    const tokenBalanceBN = bnum(tokenBalance);

    if (tokenAddress === nativeAsset.address && !disableNativeAssetBuffer) {
      // Subtract buffer for gas
      maxAmount = tokenBalanceBN.gt(nativeAsset.minTransactionBuffer)
        ? tokenBalanceBN.minus(nativeAsset.minTransactionBuffer).toString()
        : tokenBalance.toString();
    } else {
      maxAmount = tokenBalance;
    }
    return maxAmount;
  }

  /**
   * Returns true if the token is the native asset or wrapped native asset
   */
  function isWethOrEth(tokenAddress: string): boolean {
    return (
      isSameAddress(tokenAddress, nativeAsset.address) ||
      isSameAddress(tokenAddress, wrappedNativeAsset.value.address)
    );
  }

  /**
   * LIFECYCLE
   */
  onBeforeMount(async () => {
    // Inject veBAL because it's not in tokenlists.
    const { veBAL } = configService.network.addresses;
    await injectTokens([veBAL]);
    state.loading = false;
  });

  return {
    // state
    ...toRefs(state),
    nativeAsset,
    // computed
    tokens,
    wrappedNativeAsset,
    activeTokenListTokens,
    balancerTokenListTokens,
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
    injectTokens,
    searchTokens,
    hasBalance,
    approvalRequired,
    approvalsRequired,
    priceFor,
    balanceFor,
    getTokens,
    getToken,
    injectPrices,
    getMaxBalanceFor,
    isWethOrEth,
  };
};

export type TokensResponse = ReturnType<typeof tokensProvider>;
export const TokensProviderSymbol: InjectionKey<TokensResponse> = Symbol(
  symbolKeys.Providers.Tokens
);

export function provideTokens(
  userSettings: UserSettingsResponse,
  tokenLists: TokenListsResponse
) {
  const tokensResponse = tokensProvider(userSettings, tokenLists);
  provide(TokensProviderSymbol, tokensResponse);
  return tokensResponse;
}

export const useTokens = (): TokensResponse => {
  return safeInject(TokensProviderSymbol);
};
