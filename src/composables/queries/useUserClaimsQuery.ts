import { computed, reactive } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import useNetwork from '@/composables/useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';
import { ClaimService } from '@/services/claim/claim.service';
import { MultiTokenPendingClaims } from '@/services/claim/types';
import useWeb3 from '@/services/web3/useWeb3';

type UserClaimsQueryResponse = {
  multiTokenPendingClaims: MultiTokenPendingClaims[];
};

type QueryOptions = UseQueryOptions<UserClaimsQueryResponse>;

export default function useUserClaimsQuery(
  claimService: ClaimService,
  options: QueryOptions = {}
) {
  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(
    QUERY_KEYS.Claims.All(networkId, account, claimService.merkleOrchardVersion)
  );

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

  return useQuery<UserClaimsQueryResponse>(
    queryKey,
    queryFn,
    queryOptions as QueryOptions
  );
}
