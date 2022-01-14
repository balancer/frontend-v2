import { reactive, Ref } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';
import QUERY_KEYS from '@/beethovenx/constants/queryKeys';
import { beethovenxService } from '@/beethovenx/services/beethovenx/beethovenx.service';

export default function useIsGnosisSafeQuery(
  address: Ref<string>,
  options: UseQueryOptions<boolean> = {}
) {
  const queryKey = reactive(QUERY_KEYS.GnosisSafe.Current(address));

  const queryFn = async () => {
    return beethovenxService.isAddressMultisigWallet(address.value);
  };

  const queryOptions = reactive({
    enabled: true,
    ...options
  });

  return useQuery<boolean>(queryKey, queryFn, queryOptions);
}
