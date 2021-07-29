import {
  toRefs,
  toRef,
  computed,
  reactive,
  provide,
  InjectionKey,
  Ref,
  ComputedRef
} from 'vue';
import useTokenLists2 from '@/composables/useTokenLists2';
import { getAddress } from '@ethersproject/address';
import { TokenInfo, TokenInfoMap, TokenList } from '@/types/TokenList';
import useConfig from '@/composables/useConfig';
import useTokenPricesQuery from '@/composables/queries/useTokenPricesQuery';
import useAccountBalancesQuery from '@/composables/queries/useAccountBalancesQuery';
import useAccountAllowancesQuery from '@/composables/queries/useAccountAllowancesQuery';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import symbolKeys from '@/constants/symbol.keys';

/**
 * TYPES
 */
export interface TokensProviderState {
  injectedTokens: TokenInfoMap;
  allowanceContracts: string[];
}

export interface TokensProviderResponse {
  injectedTokens: Ref<TokenInfoMap>;
  allowanceContracts: Ref<string[]>;
  nativeAsset: TokenInfo;
  allTokens: ComputedRef<TokenInfoMap>;
  prices: ComputedRef<TokenPrices>;
  balances: ComputedRef<BalanceMap>;
  allowances: ComputedRef<ContractAllowancesMap>;
  dynamicDataSuccess: ComputedRef<boolean>;
  dynamicDataLoading: ComputedRef<boolean>;
  refetchPrices: Ref<Function>;
  refetchBalances: Ref<Function>;
  refetchAllowances: Ref<Function>;
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
    /* STATE */
    const state: TokensProviderState = reactive({
      injectedTokens: {},
      allowanceContracts: []
    });

    /* COMPOSABLES */
    const { networkConfig } = useConfig();
    const { activeTokenLists, defaultTokenList } = useTokenLists2();

    /* INIT STATE */
    state.allowanceContracts.push(networkConfig.addresses.vault);

    /****************************************************************
     * Static metadata
     *
     * The tokenListTokens, injectedTokens and allTokens dictionaries
     * provide the static metadata for each token.
     *****************************************************************/

    const nativeAsset: TokenInfo = {
      ...networkConfig.nativeAsset,
      chainId: networkConfig.chainId
    };

    /**
     * All tokens from active (toggled) token lists.
     *
     * Because only approved tokenlists can be activated
     * this list cannot contain unapproved tokens such as those
     * in the Blancer vetted list, e.g. LBP tokens.
     */
    const tokenListTokens = computed(
      (): TokenInfoMap => {
        return mapTokenListTokens(Object.values(activeTokenLists.value));
      }
    );

    /**
     * Combination of all active token list tokens and injected tokens.
     */
    const allTokens = computed(
      (): TokenInfoMap => ({
        ...tokenListTokens.value,
        ...state.injectedTokens,
        [networkConfig.nativeAsset.address]: nativeAsset
      })
    );

    /**
     * Tokens we want to track dynamic data for.
     *
     * Should only be the default balancer list and injected tokens.
     * Otherwise, if large token lists such as Coingecko is toggled
     * it can really slow the app down.
     */
    const trackedTokens = computed(
      (): TokenInfoMap => ({
        ...mapTokenListTokens(
          defaultTokenList.value ? [defaultTokenList.value] : []
        ),
        ...state.injectedTokens,
        [networkConfig.nativeAsset.address]: nativeAsset
      })
    );

    const trackedTokenAddresses = computed(() =>
      Object.keys(trackedTokens.value)
    );

    /****************************************************************
     * Dynamic metadata
     *
     * The prices, balances and allowances maps provide dynamic
     * metadata for each 'tracked' token.
     ****************************************************************/
    const {
      data: priceData,
      isSuccess: priceQuerySuccess,
      isLoading: priceQueryLoading,
      refetch: refetchPrices
    } = useTokenPricesQuery(trackedTokenAddresses);

    const {
      data: balanceData,
      isSuccess: balanceQuerySuccess,
      isLoading: balanceQueryLoading,
      refetch: refetchBalances
    } = useAccountBalancesQuery(trackedTokens);

    const {
      data: allowanceData,
      isSuccess: allowanceQuerySuccess,
      isLoading: allowanceQueryLoading,
      refetch: refetchAllowances
    } = useAccountAllowancesQuery(
      trackedTokenAddresses,
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

    const dynamicDataSuccess = computed(
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

    /** METHODS */
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

    provide(TokensProviderSymbol, {
      // state
      ...toRefs(state),
      // computed
      nativeAsset,
      allTokens,
      prices,
      balances,
      allowances,
      dynamicDataSuccess,
      dynamicDataLoading,
      refetchPrices,
      refetchBalances,
      refetchAllowances
    });

    return () => slots.default();
  }
};
