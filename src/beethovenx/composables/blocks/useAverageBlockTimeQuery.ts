import { reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';

/**
 * TYPES
 */
/**
 * Fetches all allowances for given tokens for each provided contract address.
 */
export default function useAverageBlockTimeQuery(
  options: UseQueryOptions<number> = {}
) {
  const queryFn = async () => {
    console.log(
      'Fetching average block time',
      await beethovenxService.getAverageBlockTime()
    );

    return beethovenxService.getAverageBlockTime();
  };

  const queryOptions = reactive({
    ...options
  });

  return useQuery<number>(['AverageBlockTime'], queryFn, queryOptions);
}
