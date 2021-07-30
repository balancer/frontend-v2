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
import useTokenLists2 from '@/composables/useTokenLists2';
import { getAddress, isAddress } from '@ethersproject/address';
import { TokenInfo, TokenInfoMap, TokenList } from '@/types/TokenList';
import useConfig from '@/composables/useConfig';
import useTokenPricesQuery from '@/composables/queries/useTokenPricesQuery';
import useAccountBalancesQuery from '@/composables/queries/useAccountBalancesQuery';
import useAccountAllowancesQuery from '@/composables/queries/useAccountAllowancesQuery';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import symbolKeys from '@/constants/symbol.keys';
import { GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS } from '@/services/gnosis/constants';
import { tokenService } from '@/services/token/token.service';
import useUserSettings from '@/composables/useUserSettings';
import { bnum } from '@/lib/utils';
import { currentLiquidityMiningRewardTokens } from '@/lib/utils/liquidityMining';
import { pick } from 'lodash';

/**
 * TYPES
 */
export interface TokensProviderState {
  loading: boolean;
  tokens: TokenInfoMap;
  allowanceContracts: string[];
}

export interface TokensProviderResponse {
  loading: Ref<boolean>;
  tokens: Ref<TokenInfoMap>;
  allowanceContracts: Ref<string[]>;
  nativeAsset: TokenInfo;
  prices: ComputedRef<TokenPrices>;
  balances: ComputedRef<BalanceMap>;
  allowances: ComputedRef<ContractAllowancesMap>;
  dynamicDataLoaded: ComputedRef<boolean>;
  dynamicDataLoading: ComputedRef<boolean>;
  refetchPrices: Ref<Function>;
  refetchBalances: Ref<Function>;
  refetchAllowances: Ref<Function>;
  injectTokens: Function;
  searchTokens: Function;
  hasBalance: Function;
  approvalsRequired: Function;
  priceFor: Function;
  getTokens: Function;
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
    const { allTokenLists } = useTokenLists2();
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
      tokens: {
        [networkConfig.nativeAsset.address]: nativeAsset
      },
      allowanceContracts: [
        networkConfig.addresses.vault,
        networkConfig.addresses.exchangeProxy,
        GP_ALLOWANCE_MANAGER_CONTRACT_ADDRESS
      ]
    });

    /**
     * COMPUTED
     */
    const tokenAddresses = computed(() => Object.keys(state.tokens));

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
      refetch: refetchPrices
    } = useTokenPricesQuery(tokenAddresses);

    const {
      data: balanceData,
      isSuccess: balanceQuerySuccess,
      isLoading: balanceQueryLoading,
      refetch: refetchBalances
    } = useAccountBalancesQuery(toRef(state, 'tokens'));

    const {
      data: allowanceData,
      isSuccess: allowanceQuerySuccess,
      isLoading: allowanceQueryLoading,
      refetch: refetchAllowances
    } = useAccountAllowancesQuery(
      toRef(state, 'tokens'),
      toRef(state, 'allowanceContracts')
    );

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
        address => !Object.keys(state.tokens).includes(address)
      );
      if (injectable.length === 0) return;

      const newTokens = await tokenService.metadata.get(
        injectable,
        allTokenLists.value
      );

      state.tokens = { ...state.tokens, ...newTokens };
    }

    /**
     * Given query, filters tokens map by name, symbol or address.
     * If address is provided, search for address in tokens or injectToken
     */
    async function searchTokens(
      query: string,
      excluded: string[] = []
    ): Promise<TokenInfoMap> {
      if (!query) return removeExcluded(state.tokens, excluded);

      if (isAddress(query)) {
        const address = getAddress(query);
        const token = state.tokens[address];
        if (token) {
          return { [address]: token };
        } else {
          await injectTokens([address]);
          return pick(state.tokens, address);
        }
      } else {
        const tokensArray = Object.entries(state.tokens);
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
        const amount = Number(amounts[index]);
        const allowance = bnum(allowances.value[contractAddress][address]);

        if (amount === 0) return false;

        return allowance.lt(amount);
      });
    }

    /**
     * Fetch price for a token
     */
    function priceFor(address: string): number {
      try {
        return prices.value[address][currency.value];
      } catch {
        return 0;
      }
    }

    /**
     * Get subset of tokens from state
     */
    function getTokens(addresses: string[]): TokenInfoMap {
      return pick(state.tokens, addresses);
    }

    /**
     * CALLBACKS
     */
    onBeforeMount(async () => {
      await injectTokens(currentLiquidityMiningRewardTokens);
      state.loading = false;
    });

    provide(TokensProviderSymbol, {
      // state
      ...toRefs(state),
      // computed
      nativeAsset,
      prices,
      balances,
      allowances,
      dynamicDataLoaded,
      dynamicDataLoading,
      // methods
      refetchPrices,
      refetchBalances,
      refetchAllowances,
      injectTokens,
      searchTokens,
      hasBalance,
      approvalsRequired,
      priceFor,
      getTokens
    });

    return () => slots.default();
  }
};
