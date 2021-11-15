import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { TokenListMap } from '@/types/TokenList';
import { tokenListService } from '@/beethovenx/services/token-list/token-list.service';
import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';
import useWeb3 from '@/services/web3/useWeb3';

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
  const { appNetworkConfig } = useWeb3();
  const queryKey = reactive(QUERY_KEYS.TokenLists.All);

  const queryFn = async () => {
    console.log('Fetching tokenLists');
    return tokenListService.getTokenListMap(
      appNetworkConfig.tokenListSanityUrl
    );
  };

  const queryOptions = reactive({
    enabled: true,
    ...FETCH_ONCE_OPTIONS,
    ...options
  });

  return useQuery<QueryResponse>(queryKey, queryFn, queryOptions);
}
