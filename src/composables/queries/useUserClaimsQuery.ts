import { computed, reactive } from 'vue';
import { useQuery, UseQueryOptions } from '@tanstack/vue-query';

import useNetwork from '@/composables/useNetwork';
import QUERY_KEYS from '@/constants/queryKeys';
import { claimService } from '@/services/claim/claim.service';
import {
  MultiTokenCurrentRewardsEstimate,
  MultiTokenPendingClaims,
} from '@/services/claim/types';
import useWeb3 from '@/services/web3/useWeb3';

type UserClaimsQueryResponse = {
  multiTokenPendingClaims: MultiTokenPendingClaims[];
  multiTokenCurrentRewardsEstimate: MultiTokenCurrentRewardsEstimate[];
  timestamp: string | null;
};

type QueryOptions = UseQueryOptions<UserClaimsQueryResponse>;

export default function useUserClaimsQuery(options: QueryOptions = {}) {
  // COMPOSABLES
  const { account, isWalletReady } = useWeb3();
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Claims.All(networkId, account));

  // COMPUTED
  const enabled = computed(() => isWalletReady.value && account.value != null);

  // METHODS
  const queryFn = async () => {
    const [multiTokenPendingClaims, multiTokenCurrentRewardsEstimate] =
      await Promise.all([
        claimService.getMultiTokensPendingClaims(account.value),
        claimService.getMultiTokensCurrentRewardsEstimate(account.value),
      ]);

    return {
      multiTokenPendingClaims,
      multiTokenCurrentRewardsEstimate: multiTokenCurrentRewardsEstimate.data,
      timestamp: multiTokenCurrentRewardsEstimate.timestamp,
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
