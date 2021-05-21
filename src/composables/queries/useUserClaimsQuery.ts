import { computed, reactive } from 'vue';
import { useQuery } from 'vue-query';
import { UseQueryOptions } from 'react-query/types';

import { bnum } from '@/lib/utils';

import useWeb3 from '@/composables/useWeb3';
import useAuth from '@/composables/useAuth';

import QUERY_KEYS from '@/constants/queryKeys';

import {
  getPendingClaims,
  getCurrentRewardsEstimate,
  Report,
  CurrentRewardsEstimate
} from '@/services/claim';

import { Claim } from '@/types';

type UserClaimsQueryResponse = {
  pendingClaims: Claim[];
  pendingClaimsReports: Report;
  availableToClaim: string;
  currentRewardsEstimate: CurrentRewardsEstimate;
  totalRewards: string;
};

export default function useUserClaimsQuery(
  options: UseQueryOptions<UserClaimsQueryResponse> = {}
) {
  // COMPOSABLES
  const { account, isConnected, appNetwork } = useWeb3();
  const auth = useAuth();

  // DATA
  const queryKey = reactive(QUERY_KEYS.Claims.All(account));

  // COMPUTED
  const isQueryEnabled = computed(
    () => isConnected.value && account.value != null
  );

  // METHODS
  const queryFn = async () => {
    const [pendingClaims, currentRewardsEstimate] = await Promise.all([
      getPendingClaims(appNetwork.id, auth.web3, account.value),
      getCurrentRewardsEstimate(account.value)
    ]);

    const availableToClaim = pendingClaims.claims
      .map(claim => parseFloat(claim.amount))
      .reduce((total, amount) => total.plus(amount), bnum(0));

    const totalRewards =
      currentRewardsEstimate != null
        ? availableToClaim.plus(currentRewardsEstimate.rewards)
        : availableToClaim;

    return {
      pendingClaims: pendingClaims.claims,
      pendingClaimsReports: pendingClaims.reports,
      availableToClaim: availableToClaim.toString(),
      totalRewards: totalRewards.toString(),
      currentRewardsEstimate
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
