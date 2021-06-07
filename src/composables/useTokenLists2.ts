import { ref, readonly, computed } from 'vue';
import TokenListService from '@/services/token-list/token-list.service';
import { TokenListGroup } from '@/types/TokenList';
import { pick } from 'lodash';
import TOKEN_LISTS from '@/constants/tokenlists';
import { lsGet, lsSet } from '@/lib/utils';
import LS_KEYS from '@/constants/local-storage.keys';

// SERVICES
const tokenListService = new TokenListService();
// State
const tokenLists = ref<TokenListGroup>({});
const toggled = ref<string[]>(
  lsGet(LS_KEYS.TokenLists.Toggled, [TOKEN_LISTS.Balancer.Default])
);
const loading = ref(true);
const failed = ref(false);

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
    loading: readonly(loading),
    failed: readonly(failed),
    all: readonly(tokenLists),
    // computed
    balancerTokenLists,
    approvedTokenLists,
    vettedTokenList,
    toggled,
    // methods
    toggleList,
    isToggled
  };
}
