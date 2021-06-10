import { ref, Ref, readonly, computed } from 'vue';
import TokenListService from '@/services/token-list/token-list.service';
import { TokenListDict } from '@/types/TokenList';
import { pick } from 'lodash';
import TOKEN_LISTS from '@/constants/tokenlists';
import { lsGet, lsSet } from '@/lib/utils';
import LS_KEYS from '@/constants/local-storage.keys';

// SERVICES
const tokenListService = new TokenListService();

// STATE
const tokenLists = ref<TokenListDict>({});
const toggled = ref<string[]>(
  lsGet(LS_KEYS.TokenLists.Toggled, [TOKEN_LISTS.Balancer.Default])
);
const loading = ref(true);
const failed = ref(false);

// INIT STATE
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

export default function useTokenLists2() {
  // COMPUTED
  const defaultTokenList = computed(
    () =>
      pick(tokenLists.value, TOKEN_LISTS.Balancer.Default)[
        TOKEN_LISTS.Balancer.Default
      ]
  );

  const balancerTokenLists = computed(() =>
    pick(tokenLists.value, TOKEN_LISTS.Balancer.All)
  );

  const vettedTokenList = computed(
    () =>
      pick(tokenLists.value, TOKEN_LISTS.Balancer.Vetted)[
        TOKEN_LISTS.Balancer.Vetted
      ]
  );

  const approvedTokenLists = computed(() =>
    pick(tokenLists.value, TOKEN_LISTS.Approved)
  );

  const toggledLists = computed(() => pick(tokenLists.value, toggled.value));

  // METHODS
  function toggleList(uri: string): void {
    if (!TOKEN_LISTS.Approved.includes(uri)) return;

    if (toggled.value.includes(uri)) {
      toggled.value.splice(toggled.value.indexOf(uri), 1);
    } else {
      toggled.value.push(uri);
    }

    lsSet(LS_KEYS.TokenLists.Toggled, toggled.value);
  }

  function isToggled(uri: string): boolean {
    return toggled.value.includes(uri);
  }

  return {
    // state
    loading: readonly(loading) as Readonly<Ref<boolean>>,
    failed: readonly(failed) as Readonly<Ref<boolean>>,
    all: readonly(tokenLists) as Readonly<Ref<TokenListDict>>,
    // computed
    defaultTokenList,
    balancerTokenLists,
    approvedTokenLists,
    vettedTokenList,
    toggledLists,
    toggled,
    // methods
    toggleList,
    isToggled
  };
}
