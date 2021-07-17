import { provide, reactive, toRefs, readonly, computed } from 'vue';
import symbolKeys from '@/constants/symbol.keys';
import localStorageKeys from '@/constants/local-storage.keys';
import { TokenList, TokenListMap } from '@/types/TokenList';
import { tokenListService } from '@/services/token-list/token-list.service';
import { lsGet, lsSet } from '@/lib/utils';
import { pick } from 'lodash';
import { configService } from '@/services/config/config.service';

const { uris } = tokenListService;

export const TokenListsProviderSymbol = Symbol(symbolKeys.Providers.TokenLists);

/** STATE */
export interface TokenListsState {
  tokenLists: TokenListMap;
  activeListKeys: string[];
  loading: boolean;
  failed: boolean;
}

const state: TokenListsState = reactive({
  tokenLists: {},
  activeListKeys: [],
  loading: true,
  failed: false
});

async function init(state: TokenListsState) {
  try {
    state.activeListKeys = lsGet(localStorageKeys.TokenLists.Toggled, [
      uris.Balancer.Default
    ]);
    state.tokenLists = await tokenListService.getAll();
  } catch (error) {
    state.failed = true;
    console.error('Failed to init tokenlists', error);
  } finally {
    state.loading = false;
  }
}

/* COMPUTED */
/**
 * The default Balancer token list.
 */
const defaultTokenList = computed(
  (): TokenList => state.tokenLists[uris.Balancer.Default]
);

/**
 * The Balancer vetted token list, contains LBP tokens.
 */
const vettedTokenList = computed(
  (): TokenList => state.tokenLists[uris.Balancer.Vetted]
);

/**
 * All Balancer token lists mapped by URI.
 */
const balancerTokenLists = computed(
  (): TokenListMap => pick(state.tokenLists, uris.Balancer.All)
);

/**
 * Approved token lists mapped by URI.
 * Approved means tokens are compliant and can be presented in the UI.
 * This excludes lists like the Balancer vetted list.
 */
const approvedTokenLists = computed(
  (): TokenListMap => pick(state.tokenLists, uris.Approved)
);

/**
 * Active token lists mappped by URI.
 * Active lists are those toggled via the token list search modal.
 */
const activeTokenLists = computed(
  (): TokenListMap => pick(state.tokenLists, state.activeListKeys)
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

export default {
  setup(props, { slots }) {
    init(state);

    provide(TokenListsProviderSymbol, {
      // state
      ...toRefs(readonly(state)),
      // computed
      defaultTokenList,
      balancerTokenLists,
      approvedTokenLists,
      vettedTokenList,
      activeTokenLists,
      // methods
      toggleTokenList,
      isActiveList,
      tokenListUrl
    });

    return () => slots.default();
  }
};
