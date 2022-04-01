import { UseQueryOptions } from 'react-query/types';
import { reactive } from 'vue';
import { useQuery } from 'vue-query';

import QUERY_KEYS from '@/constants/queryKeys';
import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';
import { tokenListService } from '@/services/token-list/token-list.service';
import { TokenListMap } from '@/types/TokenList';

import useNetwork from '../useNetwork';

/**
 * TYPES
 */
type QueryResponse = TokenListMap;

/**
 * Fetch all token lists, should only happen once.
 */
export default function useTokenListsQuery(
  options: UseQueryOptions<QueryResponse> = {}
) {
  const { networkId } = useNetwork();

  const queryKey = reactive(QUERY_KEYS.TokenLists.All(networkId));

  const queryFn = async () => {
    console.log('Fetching tokenLists');
    return await tokenListService.getAll();
  };

  const queryOptions = reactive({
    enabled: true,
    ...FETCH_ONCE_OPTIONS,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
