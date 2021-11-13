import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { FETCH_ONCE_OPTIONS } from '@/constants/vue-query';
import {
  BeethovenxConfig,
  beethovenxService
} from '@/beethovenx/services/beethovenx/beethovenx.service';

/**
 * Fetch all token lists, should only happen once.
 */
export default function useBeethovenxConfigQuery(
  options: UseQueryOptions<BeethovenxConfig> = {}
) {
  const queryKey = reactive(QUERY_KEYS.Config.All);

  const queryFn = async () => {
    console.log('Fetching beethovenx config');
    return beethovenxService.getBeethovenxConfig();
  };

  const queryOptions = reactive({
    enabled: true,
    ...FETCH_ONCE_OPTIONS,
    ...options
  });

  return useQuery<BeethovenxConfig>(queryKey, queryFn, queryOptions);
}
