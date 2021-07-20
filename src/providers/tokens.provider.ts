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
import { TokenInfoMap } from '@/types/TokenList';
import useConfig from '@/composables/useConfig';
import useTokenPricesQuery from '@/composables/queries/useTokenPricesQuery';
import useAccountBalancesQuery from '@/composables/queries/useAccountBalancesQuery';
import useAccountAllowancesQuery from '@/composables/queries/useAccountAllowancesQuery';
import { TokenPrices } from '@/services/coingecko/api/price.service';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { ContractAllowancesMap } from '@/services/token/concerns/allowances.concern';
import symbolKeys from '@/constants/symbol.keys';
import { pick } from 'lodash';

/** TYPES */
export interface TokensProviderState {
  injectedTokens: TokenInfoMap;
  trackedTokenAddresses: string[];
  allowanceContracts: string[];
}

export interface TokensProviderResponse {
  injectedTokens: Ref<TokenInfoMap>;
  trackedTokenAddresses: Ref<string[]>;
  allowanceContracts: Ref<string[]>;
  nativeToken: TokenInfoMap;
  allTokens: ComputedRef<TokenInfoMap>;
  prices: ComputedRef<TokenPrices>;
  balances: ComputedRef<BalanceMap>;
  allowances: ComputedRef<ContractAllowancesMap>;
}

/** SETUP */
export const TokensProviderSymbol: InjectionKey<TokensProviderResponse> = Symbol(
  symbolKeys.Providers.Tokens
);

/**
 * useTokens Composable
 * Interface to all token static and dynamic metatdata.
 */
export default {
  name: 'TokensProvider',

  setup(props, { slots }) {
    /* STATE */
    const state: TokensProviderState = reactive({
      injectedTokens: {},
      trackedTokenAddresses: [],
      allowanceContracts: []
    });

    /* COMPOSABLES */
    const { networkConfig } = useConfig();
    const { activeTokenLists } = useTokenLists2();

    /* INIT STATE */
    state.allowanceContracts.push(networkConfig.addresses.vault);

    /****************************************************************
     * Static metadata
     *
     * The tokenListTokens, injectedTokens and allTokens dictionaries
     * provide the static metadata for each token.
     *****************************************************************/

    const nativeToken: TokenInfoMap = {
      [networkConfig.nativeAsset.address]: {
        ...networkConfig.nativeAsset,
        chainId: networkConfig.chainId
      }
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
        const tokens = {};

        const activeTokenListTokens = Object.values(activeTokenLists.value)
          .map(list => list.tokens)
          .flat();

        activeTokenListTokens.forEach(token => {
          const address: string = getAddress(token.address);
          // Don't include if already included
          if (Object.keys(tokens).includes(address)) return;
          // Don't include if not on app network
          if (token.chainId !== networkConfig.chainId) return;

          tokens[address] = {
            ...token,
            address
          };
        });

        return tokens;
      }
    );

    const allTokens = computed(
      (): TokenInfoMap => ({
        ...tokenListTokens.value,
        ...state.injectedTokens
      })
    );

    /**
     * Tokens that we should fetch dynamic data for.
     *
     * We should only fetch dynamic data for tokens we absolutely have to.
     */
    const trackedTokens = computed(() =>
      pick(allTokens.value, state.trackedTokenAddresses)
    );

    /****************************************************************
     * Dynamic metadata
     *
     * The prices, balances and allowances maps provide dynamic
     * metadata for each 'tracked' token.
     ****************************************************************/
    const pricesQuery = useTokenPricesQuery(
      toRef(state, 'trackedTokenAddresses')
    );
    const accountBalancesQuery = useAccountBalancesQuery(trackedTokens);
    const accountAllowancesQuery = useAccountAllowancesQuery(
      toRef(state, 'trackedTokenAddresses'),
      toRef(state, 'allowanceContracts')
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
        accountAllowancesQuery.data.value
          ? accountAllowancesQuery.data.value
          : {}
    );

    provide(TokensProviderSymbol, {
      // state
      ...toRefs(state),
      // computed
      nativeToken,
      allTokens,
      prices,
      balances,
      allowances
    });

    return () => slots.default();
  }
};
