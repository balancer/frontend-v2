import { reactive, computed } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import { Token } from "@/types";
import QUERY_KEYS from '@/constants/queryKeys';
import useTokenLists2 from '../useTokenLists2';

interface TokenQueryResponse {
  all: Token[];
}

export default function useTokensQuery(
  options: UseQueryOptions<TokenQueryResponse> = {}
) {
  // COMPOSABLES
  const {
    loading: tokenListsLoading,
    failed: tokenListsFailed
  } = useTokenLists2()

  const enabled = computed(() => 
    !tokenListsLoading.value && !tokenListsFailed.value
  );

  const queryKey = reactive(QUERY_KEYS.Tokens.All);

  const queryFn = async () => {
    console.log('Loading tokens...')
    return { all: [] }
  }

  const queryOptions = reactive({
    enabled,
    ...options
  });

  return useQuery<TokenQueryResponse>(queryKey, queryFn, queryOptions);
}
