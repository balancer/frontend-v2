import { getAddress, isAddress } from '@ethersproject/address';
import { compact, pick } from 'lodash';
import {
  computed,
  ComputedRef,
  InjectionKey,
  onBeforeMount,
  provide,
  reactive,
  Ref,
  toRef,
  toRefs,
} from 'vue';

import useAllowancesQuery from '@/composables/queries/useAllowancesQuery';
import useBalancesQuery from '@/composables/queries/useBalancesQuery';
import useTokenPricesQuery from '@/composables/queries/useTokenPricesQuery';
import useConfig from '@/composables/useConfig';
import useTokenLists from '@/composables/useTokenLists';
import useUserSettings from '@/composables/useUserSettings';
import symbolKeys from '@/constants/symbol.keys';
import { TOKENS } from '@/constants/tokens';
import {
  bnum,
  getAddressFromPoolId,
  includesAddress,
  isSameAddress,
} from '@/lib/utils';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { configService } from '@/services/config/config.service';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { tokenService } from '@/services/token/token.service';
import {
  NativeAsset,
  TokenInfo,
  TokenInfoMap,
  TokenList,
} from '@/types/TokenList';

/**
 * TYPES
 */
export interface TokensProviderState {
  loading: boolean;
  injectedTokens: TokenInfoMap;
  allowanceContracts: string[];
  injectedPrices: TokenPrices;
}

export interface TokensProviderResponse {
  loading: Ref<boolean>;
  tokens: ComputedRef<TokenInfoMap>;
  injectedTokens: Ref<TokenInfoMap>;
  injectedPrices: Ref<TokenPrices>;
  allowanceContracts: Ref<string[]>;
  nativeAsset: NativeAsset;
  wrappedNativeAsset: ComputedRef<TokenInfo>;
  activeTokenListTokens: ComputedRef<TokenInfoMap>;
  balancerTokenListTokens: ComputedRef<TokenInfoMap>;
  prices: ComputedRef<TokenPrices>;
  balances: ComputedRef<BalanceMap>;
  allowances: ComputedRef<ContractAllowancesMap>;
  dynamicDataLoaded: ComputedRef<boolean>;
  dynamicDataLoading: ComputedRef<boolean>;
  priceQueryError: Ref<boolean>;
  priceQueryLoading: Ref<boolean>;
  balancesQueryError: Ref<boolean>;
  allowancesQueryError: Ref<boolean>;
  refetchPrices: Ref<() => void>;
  refetchBalances: Ref<() => void>;
  refetchAllowances: Ref<() => void>;
  injectTokens: (addresses: string[]) => Promise<void>;
  searchTokens: (
    query: string,
    excluded: string[],
    disableInjection?: boolean
  ) => Promise<TokenInfoMap>;
  hasBalance: (address: string) => boolean;
  approvalRequired: (
    tokenAddress: string,
    amount: string,
    contractAddress?: string
  ) => boolean;
  approvalsRequired: (
    tokenAddresses: string[],
    amounts: string[],
    contractAddress?: string
  ) => string[];
  priceFor: (address: string) => number;
  balanceFor: (address: string) => string;
  getTokens: (addresses: string[]) => TokenInfoMap;
  getToken: (address: string) => TokenInfo;
  injectPrices: (pricesToInject: TokenPrices) => void;
}

/**
 * SETUP
 */
export const TokensProviderSymbol: InjectionKey<TokensProviderResponse> =
  Symbol(symbolKeys.Providers.Tokens);

/**
 * TokensProvider
 * Provides an interface to all token static and dynamic metatdata.
 */
export default {
  name: 'TokensProvider',

  setup(props, { slots }) {
    /**
     * COMPOSABLES
     */
    const { networkConfig } = useConfig();
    const { allTokenLists, activeTokenLists, balancerTokenLists } =
      useTokenLists();
    const { currency } = useUserSettings();

    /**
     * STATE
     */
    const nativeAsset: NativeAsset = {
      ...networkConfig.nativeAsset,
      chainId: networkConfig.chainId,
    };

    const state: TokensProviderState = reactive({
      loading: true,
      injectedTokens: {
        [networkConfig.nativeAsset.address]: nativeAsset,
      },
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
        ...mapTokenListTokens(Object.values(allTokenLists)),
        ...state.injectedTokens,
      })
    );

    /**
     * All tokens from token lists that are toggled on.
     */
    const activeTokenListTokens = computed(
      (): TokenInfoMap =>
        mapTokenListTokens(Object.values(activeTokenLists.value))
    );

    /**
     * All tokens from Balancer token lists, e.g. 'listed' and 'vetted'.
     */
    const balancerTokenListTokens = computed(
      (): TokenInfoMap =>
        mapTokenListTokens(Object.values(balancerTokenLists.value))
    );

    /**
     * The main tokens map
     * A combination of activated token list tokens
     * and any injected tokens. Static and dynamic
     * meta data should be available for these tokens.
     */
    const tokens = computed(
      (): TokenInfoMap => ({
        ...activeTokenListTokens.value,
        ...state.injectedTokens,
      })
    );

    const tokenAddresses = computed((): string[] => Object.keys(tokens.value));

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
      isLoading: priceQueryLoading,
      isError: priceQueryError,
      refetch: refetchPrices,
    } = useTokenPricesQuery(tokenAddresses, toRef(state, 'injectedPrices'), {
      keepPreviousData: true,
    });

    const {
      data: balanceData,
      isSuccess: balanceQuerySuccess,
      isLoading: balanceQueryLoading,
      isError: balancesQueryError,
      refetch: refetchBalances,
    } = useBalancesQuery(tokens, { keepPreviousData: true });

    const {
      data: allowanceData,
      isSuccess: allowanceQuerySuccess,
      isLoading: allowanceQueryLoading,
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

    const dynamicDataLoaded = computed(
      () =>
        priceQuerySuccess.value &&
        balanceQuerySuccess.value &&
        allowanceQuerySuccess.value
    );

    const dynamicDataLoading = computed(
      () =>
        priceQueryLoading.value ||
        balanceQueryLoading.value ||
        allowanceQueryLoading.value
    );

    /**
     * METHODS
     */
    /**
     * Create token map from a token list tokens array.
     */
    function mapTokenListTokens(tokenLists: TokenList[]): TokenInfoMap {
      const tokens = [...tokenLists].map(list => list.tokens).flat();

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
      addresses = addresses.map(getAddressFromPoolId).map(getAddress);

      // Remove any duplicates
      addresses = [...new Set(addresses)];

      const existingAddresses = Object.keys(tokens.value);

      // Only inject tokens that aren't already in tokens
      const injectable = addresses.filter(
        address => !includesAddress(existingAddresses, address)
      );
      if (injectable.length === 0) return;

      const newTokens = await tokenService.metadata.get(
        injectable,
        allTokenLists
      );

      state.injectedTokens = { ...state.injectedTokens, ...newTokens };
    }

    /**
     * Given query, filters tokens map by name, symbol or address.
     * If address is provided, search for address in tokens or injectToken
     */
    async function searchTokens(
      query: string,
      excluded: string[] = [],
      disableInjection = false
    ): Promise<TokenInfoMap> {
      if (!query) return removeExcluded(tokens.value, excluded);

      const potentialAddress = getAddressFromPoolId(query);

      if (isAddress(potentialAddress)) {
        const address = getAddress(potentialAddress);
        const token = allTokenListTokens.value[address];
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
        const tokensArray = Object.entries(allTokenListTokens.value);
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
      if (address) address = getAddress(address);
      try {
        return prices.value[address][currency.value] || 0;
      } catch {
        return 0;
      }
    }

    /**
     * Fetch balance for a token
     */
    function balanceFor(address: string): string {
      if (address) address = getAddress(address);
      try {
        return balances.value[address] || '0';
      } catch {
        return '0';
      }
    }

    /**
     * Checks if token has a balance
     */
    function hasBalance(address: string): boolean {
      return Number(balances.value[address]) > 0;
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
      if (address) address = getAddress(address);
      return tokens.value[address];
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
     * LIFECYCLE
     */
    onBeforeMount(async () => {
      const tokensToInject = compact([
        configService.network.addresses.stETH,
        configService.network.addresses.wstETH,
        configService.network.addresses.veBAL,
        TOKENS.Addresses.BAL,
        TOKENS.Addresses.wNativeAsset,
      ]);

      await injectTokens(tokensToInject);
      state.loading = false;
    });

    provide(TokensProviderSymbol, {
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
    });

    return () => slots.default();
  },
};
