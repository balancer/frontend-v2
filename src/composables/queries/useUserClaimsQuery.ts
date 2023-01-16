import { UseQueryOptions } from 'react-query/types';
import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';

import useNetwork from '@/composables/useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';
import { claimService } from '@/services/claim/claim.service';
import { MultiTokenPendingClaims } from '@/services/claim/types';
import useWeb3 from '@/services/web3/useWeb3';

type UserClaimsQueryResponse = {
  multiTokenPendingClaims: MultiTokenPendingClaims[];
};

export default function useUserClaimsQuery(
  options: UseQueryOptions<UserClaimsQueryResponse> = {}
) {
  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Claims.All(networkId, account));

  // COMPUTED
  const enabled = computed(() => isWalletReady.value && account.value != null);

  // METHODS
  const queryFn = async () => {
    const multiTokenPendingClaims =
      await claimService.getMultiTokensPendingClaims(account.value);

    return {
      multiTokenPendingClaims,
    };
  };

  const queryOptions = reactive({
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options,
  });

  return useQuery<UserClaimsQueryResponse>(queryKey, queryFn, queryOptions);
}
