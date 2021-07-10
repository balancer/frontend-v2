import { ref, Ref, readonly, computed } from 'vue';
import { tokenListService } from '@/services/token-list/token-list.service';
import { TokenList, TokenListMap } from '@/types/TokenList';
import { pick } from 'lodash';
import TOKEN_LISTS from '@/constants/tokenlists';
import { lsGet, lsSet } from '@/lib/utils';
import LS_KEYS from '@/constants/local-storage.keys';
import { configService } from '@/services/config/config.service';

/* STATE */
const tokenLists = ref<TokenListMap>({});
const activeListKeys = ref<string[]>(
  lsGet(LS_KEYS.TokenLists.Toggled, [TOKEN_LISTS.Balancer.Default])
);
const loading = ref(true);
const failed = ref(false);

/* INIT STATE */
(async () => {
  try {
    tokenLists.value = await tokenListService.getAll();
  } catch (error) {
    failed.value = true;
    console.error('Failed to load tokenlists', error);
  } finally {
    loading.value = false;
  }
})();

/* COMPUTED */
/**
 * The default Balancer token list.
 */
const defaultTokenList = computed(
  (): TokenList => tokenLists.value[TOKEN_LISTS.Balancer.Default]
);

/**
 * The Balancer vetted token list, contains LBP tokens.
 */
const vettedTokenList = computed(
  (): TokenList => tokenLists.value[TOKEN_LISTS.Balancer.Vetted]
);

/**
 * All Balancer token lists mapped by URI.
 */
const balancerTokenLists = computed(
  (): TokenListMap => pick(tokenLists.value, TOKEN_LISTS.Balancer.All)
);

/**
 * Approved token lists mapped by URI.
 * Approved means tokens are compliant and can be presented in the UI.
 * This excludes lists like the Balancer vetted list.
 */
const approvedTokenLists = computed(
  (): TokenListMap => pick(tokenLists.value, TOKEN_LISTS.Approved)
);

/**
 * Active token lists mappped by URI.
 * Active lists are those toggled via the token list search modal.
 */
const activeTokenLists = computed(
  (): TokenListMap => pick(tokenLists.value, activeListKeys.value)
);

/* METHODS */
/**
 * Adds a token list to the active lists which
 * makes additonal tokens available in the token search modal.
 */
function toggleTokenList(uri: string): void {
  if (!TOKEN_LISTS.Approved.includes(uri)) return;

  if (activeListKeys.value.includes(uri)) {
    activeListKeys.value.splice(activeListKeys.value.indexOf(uri), 1);
  } else {
    activeListKeys.value.push(uri);
  }

  lsSet(LS_KEYS.TokenLists.Toggled, activeListKeys.value);
}

/**
 * Given a token list URI checks if the related token
 * list has been toggled via the token search modal.
 */
function isActiveList(uri: string): boolean {
  return activeListKeys.value.includes(uri);
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

export default function useTokenLists2() {
  return {
    // state
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    failed: readonly(failed) as Readonly<Ref<boolean>>,
    allTokenLists: readonly(tokenLists) as Readonly<Ref<TokenListMap>>,
    // computed
    defaultTokenList,
    balancerTokenLists,
    approvedTokenLists,
    vettedTokenList,
    activeTokenLists,
    activeListKeys,
    // methods
    toggleTokenList,
    isActiveList,
    tokenListUrl
  };
}
