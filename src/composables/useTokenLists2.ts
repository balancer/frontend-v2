import { ref, readonly, computed } from 'vue';
import TokenListService from '@/services/token-list/token-list.service';
import { TokenList } from '@/types/TokenList';

const tokenListService = new TokenListService();
const tokenLists = ref<TokenList[]>([]);
const loading = ref(true);

(async () => {
  tokenLists.value = await tokenListService.getAll();
  loading.value = false;
})();

export default function useTokenLists2() {
  const balancerLists = computed(() =>
    tokenLists.value.filter((list: TokenList) =>
      list.keywords?.includes('balancer')
    )
  );

  const lbpList = computed(() =>
    tokenLists.value.find((list: TokenList) =>
      list.keywords?.every(keyword => ['balancer', 'vetted'].includes(keyword))
    )
  );

  const exchangeLists = computed(() =>
    tokenLists.value.filter((list: TokenList) => list !== lbpList.value)
  );

  return {
    loading,
    all: readonly(tokenLists),
    balancer: balancerLists,
    exchange: exchangeLists,
    lbpList
  };
}
