import { reactive, ref, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/constants/queryKeys';
import { TokenListMap } from '@/types/TokenList';
import { tokenListService } from '@/services/token-list/token-list.service';

// TYPES
type Response = TokenListMap;

export default function useTokenListsQuery(
  options: UseQueryOptions<Response> = {}
) {
  const queryKey = reactive(QUERY_KEYS.TokenLists2.All);

  const queryFn = async () => {
    console.log('Fetching tokenLists');
    return await tokenListService.getAll();
  };

  const queryOptions = reactive({
    enabled: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    ...options
  });

  return useQuery<Response>(queryKey, queryFn, queryOptions);
}
