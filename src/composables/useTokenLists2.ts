import { ref, readonly, computed, watch } from 'vue';
import TokenListService from '@/services/token-list/token-list.service';
import { TokenList, TokenListGroup } from '@/types/TokenList';
import { pick } from 'lodash';
import TOKEN_LISTS from '@/constants/tokenlists';

// SERVICES
const tokenListService = new TokenListService();
// State
const tokenLists = ref<TokenListGroup>({});
const toggledLists = ref<string[]>([]);
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
  watch(tokenLists, (newVal) => {
    console.log('balancerLists', balancerLists.value);
    console.log('vettedList', vettedList.value);
    console.log('exchangeLists', exchangeLists.value);
  })

  const balancerLists = computed(() =>
    pick(tokenLists.value, TOKEN_LISTS.Balancer.All)
  );

  const vettedList = computed(() =>
    pick(tokenLists.value, TOKEN_LISTS.Balancer.Vetted)[TOKEN_LISTS.Balancer.Vetted]
  );

  const exchangeLists = computed(() =>
    pick(tokenLists.value, TOKEN_LISTS.Exchange)
  );

  return {
    loading,
    all: readonly(tokenLists),
    balancer: balancerLists,
    exchange: exchangeLists,
    vettedList
  };
}
