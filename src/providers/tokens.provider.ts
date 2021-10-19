import {
  toRefs,
  toRef,
  computed,
  reactive,
  provide,
  InjectionKey,
  Ref,
  ComputedRef,
  onBeforeMount
} from 'vue';
import { compact, pick } from 'lodash';
import { getAddress, isAddress } from '@ethersproject/address';

import { bnum, forChange } from '@/lib/utils';
import { currentLiquidityMiningRewardTokens } from '@/lib/utils/liquidityMining';

import { TokenInfo, TokenInfoMap, TokenList } from '@/types/TokenList';

import symbolKeys from '@/constants/symbol.keys';

import useTokenLists from '@/composables/useTokenLists';
import useConfig from '@/composables/useConfig';
import useTokenPricesQuery from '@/composables/queries/useTokenPricesQuery';
import useBalancesQuery from '@/composables/queries/useBalancesQuery';
import useAllowancesQuery from '@/composables/queries/useAllowancesQuery';
import useUserSettings from '@/composables/useUserSettings';

import { TokenPrices } from '@/services/coingecko/api/price.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import { tokenService } from '@/services/token/token.service';
import { configService } from '@/services/config/config.service';

/**
 * TYPES
 */
export interface TokensProviderState {
  loading: boolean;
  injectedTokens: TokenInfoMap;
  allowanceContracts: string[];
}

export interface TokensProviderResponse {
  loading: Ref<boolean>;
  tokens: ComputedRef<TokenInfoMap>;
  injectedTokens: Ref<TokenInfoMap>;
  allowanceContracts: Ref<string[]>;
  nativeAsset: TokenInfo;
  wrappedNativeAsset: ComputedRef<TokenInfo>;
  activeTokenListTokens: ComputedRef<TokenInfoMap>;
  prices: ComputedRef<TokenPrices>;
  balances: ComputedRef<BalanceMap>;
  allowances: ComputedRef<ContractAllowancesMap>;
  dynamicDataLoaded: ComputedRef<boolean>;
  dynamicDataLoading: ComputedRef<boolean>;
  priceQueryError: Ref<boolean>;
  balancesQueryError: Ref<boolean>;
  allowancesQueryError: Ref<boolean>;
  refetchPrices: Ref<() => void>;
  refetchBalances: Ref<() => void>;
  refetchAllowances: Ref<() => void>;
  injectTokens: (addresses: string[]) => Promise<void>;
  searchTokens: (query: string, excluded: string[]) => Promise<TokenInfoMap>;
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
}

/**
 * SETUP
 */
export const TokensProviderSymbol: InjectionKey<TokensProviderResponse> = Symbol(
  symbolKeys.Providers.Tokens
);

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
    const {
      allTokenLists,
      activeTokenLists,
      loadingTokenLists
    } = useTokenLists();
    const { currency } = useUserSettings();

    /**
     * STATE
     */
    const nativeAsset: TokenInfo = {
      ...networkConfig.nativeAsset,
      chainId: networkConfig.chainId
    };

    const state: TokensProviderState = reactive({
      loading: true,
      injectedTokens: {
        [networkConfig.nativeAsset.address]: nativeAsset
      },
      allowanceContracts: compact([
        networkConfig.addresses.vault,
        networkConfig.addresses.wstETH,
        networkConfig.addresses.exchangeProxy
      ])
    });

    /**
     * COMPUTED
     */

    /**
     * All tokens from token lists that are toggled on.
     */
    const activeTokenListTokens = computed(
      (): TokenInfoMap =>
        mapTokenListTokens(Object.values(activeTokenLists.value))
    );

    /**
     * The main tokens map
     * A combination of activated token list tokens
     * and any injected tokens. Static and dynamic
     * meta data should be available for these tokens.
     */
    const tokens = computed(() => ({
      ...activeTokenListTokens.value,
      ...state.injectedTokens
    }));

    const tokenAddresses = computed((): string[] => Object.keys(tokens.value));

    const wrappedNativeAsset = computed(
      (): TokenInfo => getToken(networkConfig.addresses.weth)
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
      refetch: refetchPrices
    } = useTokenPricesQuery(tokenAddresses);

    const {
      data: balanceData,
      isSuccess: balanceQuerySuccess,
      isLoading: balanceQueryLoading,
      isError: balancesQueryError,
      refetch: refetchBalances
    } = useBalancesQuery(tokens);

    const {
      data: allowanceData,
      isSuccess: allowanceQuerySuccess,
      isLoading: allowanceQueryLoading,
      isError: allowancesQueryError,
      refetch: refetchAllowances
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
      const tokensMap = {};
      const tokens = tokenLists.map(list => list.tokens).flat();

      tokens.forEach(token => {
        const address: string = getAddress(token.address);
        // Don't include if already included
        if (Object.keys(tokensMap).includes(address)) return;
        // Don't include if not on app network
        if (token.chainId !== networkConfig.chainId) return;

        tokensMap[address] = {
          ...token,
          address
        };
      });

      return tokensMap;
    }

    /**
     * Fetches static token metadata for given addresses and injects
     * tokens into state tokens map.
     */
    async function injectTokens(addresses: string[]): Promise<void> {
      addresses = addresses.map(address => getAddress(address));

      // Only inject tokens that aren't already in tokens
      const injectable = addresses.filter(
        address => !Object.keys(tokens.value).includes(address)
      );
      if (injectable.length === 0) return;

      const newTokens = await tokenService.metadata.get(
        injectable,
        allTokenLists.value
      );

      state.injectedTokens = { ...state.injectedTokens, ...newTokens };
    }

    /**
     * Given query, filters tokens map by name, symbol or address.
     * If address is provided, search for address in tokens or injectToken
     */
    async function searchTokens(
      query: string,
      excluded: string[] = []
    ): Promise<TokenInfoMap> {
      if (!query) return removeExcluded(tokens.value, excluded);

      if (isAddress(query)) {
        const address = getAddress(query);
        const token = tokens.value[address];
        if (token) {
          return { [address]: token };
        } else {
          await injectTokens([address]);
          return pick(tokens.value, address);
        }
      } else {
        const tokensArray = Object.entries(tokens.value);
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
     * Check if approval is required for given contract address
     * for a token and amount.
     */
    function approvalRequired(
      tokenAddress: string,
      amount: string,
      contractAddress = networkConfig.addresses.vault
    ): boolean {
      if (!amount || bnum(amount).eq(0) || !contractAddress) return false;

      const allowance = bnum(
        allowances.value[contractAddress][getAddress(tokenAddress)]
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
        return prices.value[address][currency.value] || 0;
      } catch {
        return 0;
      }
    }

    /**
     * Fetch balance for a token
     */
    function balanceFor(address: string): string {
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
      return pick(tokens.value, addresses);
    }

    /**
     * Get single token from state
     */
    function getToken(address: string): TokenInfo {
      return tokens.value[address];
    }

    /**
     * CALLBACKS
     */
    onBeforeMount(async () => {
      const tokensToInject = compact([
        ...currentLiquidityMiningRewardTokens,
        configService.network.addresses.stETH,
        configService.network.addresses.wstETH
      ]);

      await forChange(loadingTokenLists, false);
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
      prices,
      balances,
      allowances,
      dynamicDataLoaded,
      dynamicDataLoading,
      priceQueryError,
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
      getToken
    });

    return () => slots.default();
  }
};
