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
const toggledLists = ref<string[]>(
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
  const balancerLists = computed(() =>
    pick(tokenLists.value, TOKEN_LISTS.Balancer.All)
  );

  const vettedList = computed(
    () =>
      pick(tokenLists.value, TOKEN_LISTS.Balancer.Vetted)[
        TOKEN_LISTS.Balancer.Vetted
      ]
  );

  const exchangeLists = computed(() =>
    pick(tokenLists.value, TOKEN_LISTS.Exchange)
  );

  function toggleList(uri: string): void {
    if (!TOKEN_LISTS.Exchange.includes(uri)) return;

    if (toggledLists.value.includes(uri)) {
      toggledLists.value.splice(toggledLists.value.indexOf(uri), 1);
    } else {
      toggledLists.value.push(uri)
    }

    lsSet(LS_KEYS.TokenLists.Toggled, toggledLists.value);
  }

  return {
    loading,
    failed,
    all: readonly(tokenLists),
    balancer: balancerLists,
    exchange: exchangeLists,
    vettedList,
    toggledLists,
    toggleList
  };
}
