import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';

import QUERY_KEYS from '@/constants/queryKeys';

import { claimService } from '@/services/claim/claim.service';
import {
  PendingClaims,
  PendingClaimsMap,
  MultiTokenCurrentRewardsEstimate
} from '@/services/claim/types';

import useWeb3 from '@/services/web3/useWeb3';
import useNetwork from '@/composables/useNetwork';

type UserClaimsQueryResponse = {
  pendingClaims: PendingClaims[];
  pendingClaimsMap: PendingClaimsMap | null;
  multiTokenCurrentRewardsEstimate: MultiTokenCurrentRewardsEstimate | null;
};

export default function useUserClaimsQuery(
  options: UseQueryOptions<UserClaimsQueryResponse> = {}
) {
  // COMPOSABLES
  const { account, isWalletReady, appNetworkConfig, getProvider } = useWeb3();
  const { networkId } = useNetwork();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Claims.All(networkId, account));

  // COMPUTED
  const isQueryEnabled = computed(
    () => isWalletReady.value && account.value != null
  );

  // METHODS
  const queryFn = async () => {
    const [
      multiTokenPendingClaims,
      multiTokenCurrentRewardsEstimate
    ] = await Promise.all([
      claimService.getMultiTokenPendingClaims(getProvider(), account.value),
      claimService.getMultiTokenCurrentRewardsEstimate(
        appNetworkConfig.chainId,
        account.value
      )
    ]);

    return {
      pendingClaims: multiTokenPendingClaims?.pendingClaims ?? [],
      pendingClaimsMap: multiTokenPendingClaims?.pendingClaimsMap ?? null,
      multiTokenCurrentRewardsEstimate
    };
  };

  const queryOptions = reactive({
    enabled: isQueryEnabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...options
  });

  return useQuery<UserClaimsQueryResponse>(queryKey, queryFn, queryOptions);
}
