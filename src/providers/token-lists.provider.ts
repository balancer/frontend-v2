import {
  provide,
  reactive,
  toRefs,
  computed,
  InjectionKey,
  ComputedRef,
  Ref
} from 'vue';
import symbolKeys from '@/constants/symbol.keys';
import localStorageKeys from '@/constants/local-storage.keys';
import { TokenList, TokenListMap } from '@/types/TokenList';
import { tokenListService } from '@/services/token-list/token-list.service';
import { lsGet, lsSet } from '@/lib/utils';
import { pick } from 'lodash';
import { configService } from '@/services/config/config.service';
import useTokenListsQuery from '@/composables/queries/useTokenListsQuery';

/** TYPES */
export interface TokenListsState {
  activeListKeys: string[];
}

export interface TokenListsProviderResponse {
  activeListKeys: Ref<string[]>;
  allTokenLists: ComputedRef<TokenListMap>;
  activeTokenLists: ComputedRef<TokenListMap>;
  defaultTokenList: ComputedRef<TokenList>;
  balancerTokenLists: ComputedRef<TokenListMap>;
  approvedTokenLists: ComputedRef<TokenListMap>;
  vettedTokenList: ComputedRef<TokenList>;
  toggleTokenList: Function;
  isActiveList: Function;
  tokenListUrl: Function;
}

/** SETUP */
const { uris } = tokenListService;
export const TokenListsProviderSymbol: InjectionKey<TokenListsProviderResponse> = Symbol(
  symbolKeys.Providers.TokenLists
);

export default {
  name: 'TokenListsProvider',

  setup(props, { slots }) {
    /**
     * Token list keys that have been activated in a previous session
     * or return the Balancer default list.
     */
    const lsListKeys = lsGet(localStorageKeys.TokenLists.Toggled, [
      uris.Balancer.Default
    ]);

    /** STATE */
    const state: TokenListsState = reactive({
      activeListKeys: lsListKeys
    });

    /** QUERIES */
    const tokenListsQuery = useTokenListsQuery();

    /* COMPUTED */
    /**
     * All token lists
     */
    const allTokenLists = computed(
      (): TokenListMap =>
        tokenListsQuery.data.value ? tokenListsQuery.data.value : {}
    );

    /**
     * All active (toggled) tokenlists
     */
    const activeTokenLists = computed(
      (): TokenListMap => pick(allTokenLists.value, state.activeListKeys)
    );

    /**
     * The default Balancer token list.
     */
    const defaultTokenList = computed(
      (): TokenList => allTokenLists.value[uris.Balancer.Default]
    );

    /**
     * The Balancer vetted token list, contains LBP tokens.
     */
    const vettedTokenList = computed(
      (): TokenList => allTokenLists.value[uris.Balancer.Vetted]
    );

    /**
     * All Balancer token lists mapped by URI.
     */
    const balancerTokenLists = computed(
      (): TokenListMap => pick(allTokenLists.value, uris.Balancer.All)
    );

    /**
     * Approved token lists mapped by URI.
     * Approved means tokens are compliant and can be presented in the UI.
     * This excludes lists like the Balancer vetted list.
     */
    const approvedTokenLists = computed(
      (): TokenListMap => pick(allTokenLists.value, uris.Approved)
    );

    /* METHODS */
    /**
     * Adds a token list to the active lists which
     * makes additonal tokens available in the token search modal.
     */
    function toggleTokenList(uri: string): void {
      if (!uris.Approved.includes(uri)) return;

      if (state.activeListKeys.includes(uri)) {
        state.activeListKeys.splice(state.activeListKeys.indexOf(uri), 1);
      } else {
        state.activeListKeys.push(uri);
      }

      lsSet(localStorageKeys.TokenLists.Toggled, state.activeListKeys);
    }

    /**
     * Given a token list URI checks if the related token
     * list has been toggled via the token search modal.
     */
    function isActiveList(uri: string): boolean {
      return state.activeListKeys.includes(uri);
    }

    /**
     * Given a token list URI returns a URL
     */
    function tokenListUrl(uri: string): string {
      const { IPFS_NODE } = configService.env;
      return uri
        .replace('ipfs://', `https://${IPFS_NODE}/ipfs/`)
        .replace('ipns://', `https://${IPFS_NODE}/ipns/`);
    }

    provide(TokenListsProviderSymbol, {
      // state
      ...toRefs(state),
      // computed
      allTokenLists,
      activeTokenLists,
      defaultTokenList,
      balancerTokenLists,
      approvedTokenLists,
      vettedTokenList,
      // methods
      toggleTokenList,
      isActiveList,
      tokenListUrl
    });

    return () => slots.default();
  }
};
